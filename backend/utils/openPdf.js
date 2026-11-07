// frontend/src/utils/openPdf.js
// PDF-urile nu mai sunt publice: cerem serverului un link temporar și abia apoi îl deschidem.
import apiClient from '../apiClient';

// Întoarce un URL complet, valabil câteva minute (folosește-l în <iframe>, react-pdf etc.)
export const getSignedPdfUrl = async (caleStocarePDF) => {
  const { data } = await apiClient.get('/files/signed-url', { params: { path: caleStocarePDF } });
  return `${apiClient.defaults.baseURL}${data.url}`;
};

// Deschide PDF-ul într-un tab nou
export const openPdf = async (caleStocarePDF) => {
  // Fereastra se deschide imediat (la click), altfel browserul blochează pop-up-ul după așteptarea răspunsului
  const win = window.open('', '_blank');
  try {
    const url = await getSignedPdfUrl(caleStocarePDF);
    if (win) win.location.href = url;
    else window.location.href = url;
  } catch (err) {
    if (win) win.close();
    alert(err.response?.status === 404
      ? 'Fișierul nu mai există pe server.'
      : 'Documentul nu a putut fi deschis. Încercați din nou.');
  }
};