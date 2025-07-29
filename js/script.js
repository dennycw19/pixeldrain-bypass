async function generateBypass() {
    const urlInput = document.getElementById('url-input').trim();
    const urls = urlInput.split('/\r?\n/').map((url) => url.trim()).filter(Boolean);
    const outputContainer = document.getElementById('output-container');
    const messageBox = document.getElementById('message-box');
    const resultContainer = document.getElementById('result-container');
    const buttonText = document.getElementById('button-text');
    const bypassButton = document.getElementById('bypass-button');
    const spinner = document.getElementById('spinner');

    buttonText.textContent = 'Bypassing...';
    spinner.classList.remove('hidden');
    bypassButton.disabled = true;
    messageBox.classList.add('hidden');
    messageBox.className = "m-4 rounded text-sm";
    messageBox.textContent = "";
    resultContainer.innerHTML = "";

    if (urls.length === 0) {
        messageBox.classList.remove('hidden');
        messageBox.classList.add('bg-red-500', 'text-white');
        messageBox.textContent = "⚠️ Please enter at least one Pixeldrain URL.";
        buttonText.textContent = 'Bypass';
        spinner.classList.add('hidden');
        bypassButton.disabled = false;
        return;
    }

    let successCount = 0;

    for (const url of urls){
        try{
            const response = await fetch("/", {
                method: "POST",
                headers:{"Content-Type": "application/json"},
                body: JSON.stringify({url}),
            });
            if (!response.ok) continue;

            const result = await response.json();
            const viewer = result.viewerData;

            if(viewer.type === "list"){
                const {files, title} = viewer.api_response;
                resultContainer.innerHTML += `
                    <div class="bg-gray-800 p-4 rounded-md">
                        <h3 class="text-lg font-semibold text-white">${title}</h3>
                        <ul class="list-disc pl-5 mt-2">
                            ${files.map(file => `<li><a href="${file.url}" class="text-blue-400 hover:underline">${file.name}</a></li>`).join('')}
                        </ul>
                    </div>`;
                successCount++;
            } else if(viewer.type === "file"){
                const file = viewer.api_response;
                resultContainer.innerHTML += `
                    <div class="bg-gray-800 p-4 rounded-md">
                        <h3 class="text-lg font-semibold text-white">${file.name}</h3>
                        <p class="text-gray-400">Size: ${file.size} bytes</p>
                        <a href="${file.url}" class="text-blue-400 hover:underline">Download</a>
                    </div>`;
                successCount++;
            }
        } catch (error) {
            continue;
        }
    }

    if (successCount > 0) {
        // messageBox.classList.remove('hidden');
        messageBox.classList.add('bg-green-500', 'text-white');
        messageBox.textContent = `✅ Successfully bypassed ${successCount} URL(s).`;
        // outputContainer.classList.remove('hidden');
    } else {
        // messageBox.classList.remove('hidden');
        messageBox.classList.add('bg-red-500', 'text-white');
        messageBox.textContent = "⚠️ No valid Pixeldrain URLs found.";
    }

    outputContainer.classList.remove('hidden');
    outputContainer.scrollIntoView({ behavior: "smooth" });
    buttonText.textContent = 'Bypass';
    spinner.classList.add('hidden');
    bypassButton.disabled = false;
}