const root = document.querySelector('#root');
const people = [
  ['Aisha Khan', 'aisha@example.test', 'Engineering'], ['Ben Carter', 'ben@example.test', 'Sales'],
  ['Carla Diaz', 'carla@example.test', 'Engineering'], ['David Evans', 'david@example.test', 'Support'],
  ['Emma Foster', 'emma@example.test', 'Sales'], ['Farah Green', 'farah@example.test', 'Support'],
  ['Grace Hall', 'grace@example.test', 'Engineering'], ['Henry Irwin', 'henry@example.test', 'Sales'],
  ['Isla Jones', 'isla@example.test', 'Support'], ['Jack King', 'jack@example.test', 'Engineering'],
  ['Keira Lane', 'keira@example.test', 'Sales'], ['Liam Moore', 'liam@example.test', 'Support'],
];
const api = (url, options = {}) => fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
function login() {
  root.innerHTML = `<h1>Sign in</h1><form id="login"><label>Email<input name="email" type="email" required></label><label>Password<input name="password" type="password" required></label><button>Sign in</button><p role="alert"></p></form>`;
  document.querySelector('#login').onsubmit = async e => {
    e.preventDefault(); const data = Object.fromEntries(new FormData(e.target));
    const response = await api('/api/login', { method: 'POST', body: JSON.stringify(data) });
    if (response.ok) location.href = '/app'; else document.querySelector('[role=alert]').textContent = (await response.json()).error;
  };
}
function dashboard() {
  root.innerHTML = `<nav><h1>Workspace</h1><button id="logout">Sign out</button></nav>
    <section aria-label="Directory"><h2>People directory</h2>
    <label>Search people<input id="search" type="search"></label>
    <table aria-label="People"><thead><tr><th aria-sort="ascending"><button id="sort">Name</button></th><th>Email</th><th>Department</th></tr></thead><tbody></tbody></table>
    <p id="empty" hidden>No people found</p><nav aria-label="Pagination"><button id="previous">Previous</button><span id="page" role="status"></span><button id="next">Next</button></nav>
    <button id="download">Download CSV</button></section>
    <section aria-label="Preferences"><h2>Preferences</h2><form id="preferences"><fieldset><legend>Contact method</legend><label><input name="contact" type="radio" value="Email" checked>Email</label><label><input name="contact" type="radio" value="Phone">Phone</label></fieldset>
    <label>Department<select id="department"><option>Engineering</option><option>Sales</option><option>Support</option></select></label>
    <label>Skills<select id="skills" multiple><option value="typescript">TypeScript</option><option value="playwright">Playwright</option><option value="api">API testing</option></select></label>
    <button>Save preferences</button><p id="saved" role="status"></p></form></section>
    <section aria-label="Files"><h2>Upload a file</h2><label>Attachment<input id="attachment" type="file" accept=".txt,.csv"></label><p id="uploaded" role="status"></p><pre id="preview"></pre></section>
    <section aria-label="Invitations"><h2>Invite a teammate</h2><button id="invite">Invite teammate</button><p id="invited" role="status"></p></section>
    <dialog aria-labelledby="invite-title"><h2 id="invite-title">Invite teammate</h2><form id="invitation"><label>Recipient email<input name="to" type="email" required></label><button>Send invitation</button><button type="button" id="cancel">Cancel</button><p role="alert"></p></form></dialog>`;
  let page = 1, ascending = true;
  const filtered = () => people.filter(row => row.join(' ').toLowerCase().includes(document.querySelector('#search').value.toLowerCase())).sort((a,b) => ascending ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0]));
  function render() {
    const rows = filtered(), total = Math.max(1, Math.ceil(rows.length / 5)); page = Math.min(page, total);
    const tbody = document.querySelector('tbody'); tbody.replaceChildren();
    rows.slice((page - 1) * 5, page * 5).forEach(row => { const tr = document.createElement('tr'); row.forEach(value => { const td = document.createElement('td'); td.textContent = value; tr.append(td); }); tbody.append(tr); });
    document.querySelector('#page').textContent = `Page ${page} of ${total} (${rows.length} results)`;
    document.querySelector('#previous').disabled = page === 1; document.querySelector('#next').disabled = page === total;
    document.querySelector('#empty').hidden = rows.length > 0;
    document.querySelector('th').setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
  }
  document.querySelector('#search').oninput = () => { page = 1; render(); };
  document.querySelector('#sort').onclick = () => { ascending = !ascending; page = 1; render(); };
  document.querySelector('#previous').onclick = () => { page--; render(); };
  document.querySelector('#next').onclick = () => { page++; render(); };
  document.querySelector('#download').onclick = () => {
    const csv = ['Name,Email,Department', ...filtered().map(row => row.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const a = document.createElement('a'); a.href = url; a.download = 'people.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  document.querySelector('#preferences').onsubmit = e => {
    e.preventDefault(); const contact = document.querySelector('input[name=contact]:checked').value;
    const department = document.querySelector('#department').value; const skills = [...document.querySelector('#skills').selectedOptions].map(x => x.textContent);
    document.querySelector('#saved').textContent = `Saved: ${contact}; ${department}; ${skills.join(', ') || 'No skills'}`;
  };
  document.querySelector('#attachment').onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    if (!/\.(txt|csv)$/i.test(file.name)) { document.querySelector('#uploaded').textContent = 'Unsupported file type'; return; }
    const response = await fetch(`/api/uploads?name=${encodeURIComponent(file.name)}`, { method: 'POST', body: file });
    const result = await response.json();
    if (!response.ok) { document.querySelector('#uploaded').textContent = result.error; return; }
    document.querySelector('#preview').textContent = result.text;
    document.querySelector('#uploaded').textContent = `Uploaded ${result.name} (${result.size} bytes)`;
    document.querySelector('#uploaded').dataset.uploadId = result.id;
  };
  const dialog = document.querySelector('dialog');
  document.querySelector('#invite').onclick = () => { document.querySelector('#invitation').reset(); dialog.querySelector('[role=alert]').textContent = ''; dialog.showModal(); };
  document.querySelector('#cancel').onclick = () => dialog.close();
  document.querySelector('#invitation').onsubmit = async e => {
    e.preventDefault(); const to = new FormData(e.target).get('to');
    const response = await api('/api/messages', { method: 'POST', body: JSON.stringify({ to }) });
    if (response.ok) { dialog.close(); document.querySelector('#invited').textContent = `Invitation sent to ${to}`; }
    else dialog.querySelector('[role=alert]').textContent = (await response.json()).error;
  };
  document.querySelector('#logout').onclick = async () => { await api('/api/logout', { method: 'POST' }); location.href = '/login'; };
  render();
}
(async () => {
  if (location.pathname !== '/app') return login();
  const response = await api('/api/me'); if (!response.ok) { location.replace('/login'); return; } dashboard();
})();
