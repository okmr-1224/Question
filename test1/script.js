document.getElementById('survey-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const username = form.username.value;
  const answer = form.answer.value;

  const res = await fetch('/.netlify/functions/submit-response', {
    method: 'POST',
    body: JSON.stringify({ username, answer }),
  });

  const msg = document.getElementById('message');
  if (res.ok) {
    msg.textContent = '送信完了！ありがとう💖';
    form.reset(); // ←ここ追加すると次の人が使いやすい♪
    loadChart(); // 再読み込みしてグラフ更新
  } else {
    msg.textContent = '送信失敗しちゃった…😢';
  }
});

async function loadChart() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/okmr-1224/Question/main/data/responses.json');
    if (!response.ok) throw new Error('fetch失敗！');
    const data = await response.json();

    const counts = {};
    for (const entry of data) {
      counts[entry.answer] = (counts[entry.answer] || 0) + 1;
    }

    const labels = Object.keys(counts);
    const values = Object.values(counts);

    // 🌈 属性ごとの色を定義！
    const colorMap = {
      'ノーマル': '#949495',
      'ほのお': '#E56C3E',
      'みず': '#5185C5',
      'でんき': '#F6D851',
      'くさ': '#66A945',
      'こおり': '#91D6F0',
      'かくとう': '#E09C40',
      'どく': '#735198',
      'じめん': '#9C7743',
      'ひこう': '#A2C3E7',
      'エスパー': '#DD6B7B',
      'むし': '#9FA244',
      'いわ': '#BFB889',
      'ゴースト': '#684870',
      'ドラゴン': '#535CA8',
      'あく': '#4C4948',
      'はがね': '#69A9C7',
      'フェアリー': '#DAB4D4'
    };

    // 🖍️ 回答に応じて色を選ぶ
    const colors = labels.map(label => colorMap[label] || '#999999');

    const ctx = document.getElementById('chart').getContext('2d');
    if (window.myChart) window.myChart.destroy(); // 前のグラフがあれば消す

    window.myChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });
  } catch (err) {
    console.error('グラフ読み込み失敗！', err);
    document.getElementById('message').textContent = 'グラフ読み込みに失敗しました😢';
  }
}


window.addEventListener('DOMContentLoaded', loadChart);
