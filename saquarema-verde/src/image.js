// Reduz a foto no navegador (máx. 1600 px, JPEG) antes de enviar: site mais rápido e upload leve.
export const resizeImage = (file, max = 1600, quality = 0.82) =>
  new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const i = new Image();
    i.onerror = () => { URL.revokeObjectURL(url); rej(new Error("Não foi possível ler a imagem.")); };
    i.onload = () => {
      URL.revokeObjectURL(url);
      const k = Math.min(1, max / Math.max(i.width, i.height));
      const c = document.createElement("canvas");
      c.width = Math.round(i.width * k); c.height = Math.round(i.height * k);
      c.getContext("2d").drawImage(i, 0, 0, c.width, c.height);
      c.toBlob((b) => (b ? res(b) : rej(new Error("Falha ao processar a imagem."))), "image/jpeg", quality);
    };
    i.src = url;
  });
