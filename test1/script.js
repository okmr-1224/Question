document.getElementById('survey-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const username = form.username.value;
  const answer = form.answer.value;
  const comment = form.comment.value;

  const res = await fetch('/.netlify/functions/submit-response', {
    method: 'POST',
    body: JSON.stringify({ username, answer, comment })
  });

  const msg = document.getElementById('message');
  if (res.ok) {
    msg.textContent = '送信完了！ありがとう😂';
    form.reset();
    loadChart();
  } else {
    msg.textContent = '送信失敗しちゃった…😢';
  }
});

async function loadChart() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/okmr-1224/Question/main/data/responses.json');
    if (!response.ok) throw new Error('fetch失敗！');
    const data = await response.json();

    // 集計
    const counts = {};
    for (const entry of data) {
      counts[entry.answer] = (counts[entry.answer] || 0) + 1;
    }

    const labels = Object.keys(counts);
    const values = Object.values(counts);
    const backgroundColors = labels.map(label => {
      switch (label) {
        case 'ノーマル': return '#949495';
        case 'ほのお': return '#E56C3E';
        case 'みず': return '#5185C5';
        case 'でんき': return '#F6D851';
        case 'くさ': return '#66A945';
        case 'こおり': return '#91D6F0';
        case 'かくとう': return '#E09C40';
        case 'どく': return '#735198';
        case 'じめん': return '#9C7743';
        case 'ひこう': return '#A2C3E7';
        case 'エスパー': return '#DD6B7B';
        case 'むし': return '#9FA244';
        case 'いわ': return '#BFB889';
        case 'ゴースト': return '#684870';
        case 'ドラゴン': return '#535CA8';
        case 'あく': return '#4C4948';
        case 'はがね': return '#69A9C7';
        case 'フェアリー': return '#DAB4D4';
        default: return '#FFFFFF';
      }
    });

    const ctx = document.getElementById('chart').getContext('2d');
    if (window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: backgroundColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });

    // 最新3件表示（カード風）
    const container = document.querySelector('.card-container');
    container.innerHTML = ''; // リセット
    const recent = data.slice(-3).reverse();
    for (const entry of recent) {
      const card = document.createElement('div');
      card.className = 'voice-card';
      card.innerHTML = `
        <strong>${entry.username} さん</strong> が選んだタイプ：<br>${entry.answer}
        <em>${entry.comment || "（コメントなし）"}</em>
      `;
      container.appendChild(card);
    }

  } catch (err) {
    console.error('グラフ読み込み失敗！', err);
    document.getElementById('message').textContent = 'グラフ読み込みに失敗しました😢';
  }
}

window.addEventListener('DOMContentLoaded', loadChart);
