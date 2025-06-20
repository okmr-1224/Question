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

    // グラフ表示
    const counts = {};
    for (const entry of data) {
      counts[entry.answer] = (counts[entry.answer] || 0) + 1;
    }
    const labels = Object.keys(counts);
    const values = Object.values(counts);
    const ctx = document.getElementById('chart').getContext('2d');
    if (window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: ['#5185C5','#E56C3E','#F6D851','#66A945'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });

    // お客様の声表示（最新3件）
    const container = document.querySelector('.card-container');
    container.innerHTML = '';
    const recent = data.slice(-3).reverse();
    for (const entry of recent) {
      const card = document.createElement('div');
      card.className = 'voice-card';
      card.setAttribute('data-type', entry.answer);

      const emoji = ['👦','👩','😎','🧠','🧸','👽'][entry.username.length % 6];
      const lines = (entry.comment || '（コメントなし）').split(/\\n|\n/);

      card.innerHTML = `
        <div class="card-left">
          <div class="face">${emoji}</div>
          <div class="username">${entry.username} さん</div>
        </div>
        <div class="card-divider"></div>
        <div class="card-right">
          <div class="type">${entry.answer} タイプ</div>
          <div class="comment">
            ${lines.map(line => `<p>${line}</p>`).join('')}
          </div>
        </div>
      `;
      container.appendChild(card);
    }

  } catch (err) {
    console.error('グラフ読み込み失敗！', err);
    document.getElementById('message').textContent = 'グラフ読み込みに失敗しました😢';
  }
}

window.addEventListener('DOMContentLoaded', loadChart);
