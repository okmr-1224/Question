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

    const ctx = document.getElementById('chart').getContext('2d');
    if (window.myChart) window.myChart.destroy(); // 前のグラフがあれば消す

    window.myChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: ['#ffadad', '#9bf6ff', '#caffbf'],
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
