import fetch from "node-fetch"
async function Upload(buffer, filename) {
    const chunkSize = 5 * 1024 * 1024; 
    const totalChunks = Math.ceil(buffer.byteLength / chunkSize);
    let currentChunkIndex = 0;
    while (currentChunkIndex < totalChunks) {
        const start = currentChunkIndex * chunkSize;
        const end = Math.min(buffer.byteLength, start + chunkSize);
        const chunk = buffer.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', new Blob([chunk]));
        formData.append('fileName', filename);
        formData.append('chunkIndex', currentChunkIndex);
        formData.append('totalChunks', totalChunks);

        const response = await fetch('https://cdn.alands.xyz/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }
        let result = await response.json(); 
                if (response.ok && currentChunkIndex === totalChunks - 1) {
                return "https://cdn.alands.xyz/files/" + result.fileId + "?&filename=" + result.filename
                }

                currentChunkIndex++;

    }

}
export {
  Upload
}