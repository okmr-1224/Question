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

    const latestDiv = document.getElementById('latest');
    const recent = data.slice(-3).reverse();
    
    latestDiv.innerHTML = '<h3>最新の回答✨</h3>' + recent.map(entry => {
      const emojis = ['😀','😄','😎','😍','🧐','🤓','🥰','😇','😜','🤠'];
      const emoji = emojis[entry.timestamp % emojis.length] || '✨';
      const comment = entry.comment || '（コメントなし）';

      return `
        <div class="card" data-type="${entry.answer}">
          <div class="card-left">
            <div class="emoji">${emoji}</div>
            <div class="username">${entry.username} さん</div>
          </div>
          <div class="card-right">
            <div class="type" data-type="${entry.answer}">${entry.answer} タイプ</div>
            <div class="comment">${comment}</div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('グラフ読み込み失敗！', err);
    document.getElementById('message').textContent = 'グラフ読み込みに失敗しました😢';
  }
}

window.addEventListener('DOMContentLoaded', loadChart);
