// ============ ACCORDION: abrir/fechar todas ============
const toggleAllBtn = document.getElementById('toggleAll');
const proposalItems = Array.from(document.querySelectorAll('.proposal-item'));
if (toggleAllBtn && proposalItems.length) {
  toggleAllBtn.addEventListener('click', () => {
    const shouldOpen = proposalItems.some(item => !item.open);
    proposalItems.forEach(item => { item.open = shouldOpen; });
    toggleAllBtn.textContent = shouldOpen ? 'Fechar todas as propostas' : 'Abrir todas as propostas';
  });
}

// ============ ABRIR SEÇÃO AO ACESSAR VIA LINK (#id) ============
function openFromHash() {
  if (!location.hash) return;
  const target = document.querySelector(location.hash);
  if (target && target.classList.contains('proposal-item')) {
    target.open = true;
    setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }
}
window.addEventListener('hashchange', openFromHash);
openFromHash();
