// pdfUtils.js
export const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
};

export const handlePdfContent = (content, fileName = 'document.pdf', mimeType = 'application/pdf') => {
    const byteArray = base64ToArrayBuffer(content);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = window.URL.createObjectURL(blob);

    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};