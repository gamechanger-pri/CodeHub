const API = 'http://localhost:5000/api';

async function run() {
  try {
    const ts = Date.now();
    const name = `e2e_node_${ts}`;
    const email = `e2e_node_${ts}@example.com`;
    const pass = 'Password123!';

    console.log('Registering...');
    await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass }),
    });

    console.log('Logging in...');
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    const loginBody = await loginRes.json();
    if (!loginBody.success) throw new Error('Login failed');
    const token = loginBody.data.token;
    console.log('Token acquired');

    console.log('Creating question...');
    const qRes = await fetch(`${API}/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'E2E Node Question', body: 'Body from node', tags: ['e2e'] }),
    });
    const qBody = await qRes.json();
    const qid = qBody.data._id;
    console.log('Question created:', qid);

    console.log('Posting answer...');
    const aRes = await fetch(`${API}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ question_id: qid, answer: 'Node test answer' }),
    });
    const aBody = await aRes.json();
    const aid = aBody.data._id;
    console.log('Answer posted:', aid);

    console.log('Voting answer...');
    const voteRes = await fetch(`${API}/answer/${aid}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type: 'up' }),
    });
    const voteBody = await voteRes.json();
    console.log('Vote response:', voteBody);

    console.log('Fetching question to verify answer votes...');
    const getQ = await fetch(`${API}/question/${qid}`, { headers: { Authorization: `Bearer ${token}` } });
    const getQBody = await getQ.json();
      console.log('GET /question response:', JSON.stringify(getQBody));
      const q = Array.isArray(getQBody.data) ? getQBody.data[0] : getQBody.data;
      if (q && q.answerDetails && q.answerDetails.length > 0) {
        console.log('Answer votes:', q.answerDetails[0].votes);
      } else {
        console.log('No answerDetails present in response');
      }

    console.log('E2E node test completed');
  } catch (err) {
    console.error('E2E test failed', err);
    process.exit(1);
  }
}

run();
