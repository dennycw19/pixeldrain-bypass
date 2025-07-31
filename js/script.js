async function generateBypass(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const urlInput = document.getElementById('url-input').value.trim();
    const urls = urlInput
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    
    const outputContainer = document.getElementById('output-container');
    const messageBox = document.getElementById('message-box');
    const resultContainer = document.getElementById('result-container');
    const buttonText = document.getElementById('button-text');
    const bypassButton = document.getElementById('bypass-button');
    const spinner = document.getElementById('spinner');


    buttonText.textContent = 'Bypassing...';
    spinner.classList.remove('hidden');
    bypassButton.disabled = true;
    outputContainer.classList.add('hidden');
    messageBox.className = "p-3 rounded text-sm font-semibold text-center mb-4";
    messageBox.textContent = "";
    resultContainer.innerHTML = "";

    if (urls.length === 0) {
        messageBox.classList.add('bg-yellow-500', 'text-white');
        messageBox.textContent = "⚠️ Please enter at least one Pixeldrain URL.";
        outputContainer.classList.remove('hidden');
        buttonText.textContent = "Bypass";
        spinner.classList.add('hidden');
        bypassButton.disabled = false;
        return;
    }

    let successCount = 0;

    for (const url of urls){
        try{
            const response = await fetch("https://pixeldrain-bypass.up.railway.app/php/bypass.php", {
                method: "POST",
                headers:{"Content-Type": "application/json"},
                body: JSON.stringify({url}),
            });
            
            // if (!response.ok) console.error("Failed to fetch bypass data for URL:", url, "Status:", response.status);

            const result = await response.json();
            const viewer = result.viewerData;

            if(result.limit_reached){
                messageBox.classList.add('bg-red-500', 'text-white');
                messageBox.textContent = "⚠️ Rate limit reached. Please try again after " + result.retry_after + " seconds.";
                outputContainer.classList.remove('hidden');
                buttonText.textContent = "Bypass";
                spinner.classList.add('hidden');
                bypassButton.disabled = false;
                return;
            }

            if (viewer.type === "list") {
                const { files, title } = viewer.api_response;
                resultContainer.innerHTML += `
                    <div class="mb-6">
                        <h2 class="text-lg font-semibold text-white mb-1">${title}</h2>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${files.map((file) => {
                                const fileUrl = `https://pixeldrain.com/u/${file.id}`;
                                const sizeMB = (file.size / 1024 / 1024).toFixed(2);
                                return `
                                    <div class="bg-gray-800 p-4 rounded-md pt-4 max-w-full">
                                        <h3 class="text-lg font-semibold text-white break-all whitespace-normal overflow-hidden">${file.name}</h3>
                                        <p class="text-gray-400">Size: ${sizeMB} MB</p>
                                        <a href="https://pd.cybar.xyz/${file.id}" target="_blank" class="inline-flex text-center text-white bg-blue-500 rounded hover:bg-blue-600 p-1"><span class="material-symbols-outlined">download_for_offline</span>Download</a>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>`;
                successCount++;
            } else if(viewer.type === "file"){
                const file = viewer.api_response;
                resultContainer.innerHTML += `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div class="p-4 bg-gray-800 rounded-md max-w-full">
                            <p class="text-lg font-semibold text-white  break-all whitespace-normal overflow-hidden">${file.name}</p>
                            <p class="text-gray-400">Size: ${(file.size/1024/1024).toFixed(2)} MB</p>
                            <a href="https://pd.cybar.xyz/${file.id}" class="inline-flex text-center text-white bg-blue-500 rounded hover:bg-blue-600 p-1"><span class="material-symbols-outlined">download_for_offline</span>Download</a>
                        </div>
                    </div>`;
                successCount++;
            }
        } catch (error) {
            console.error("Error processing URL:", url, error);
        }
    }

    if (successCount > 0) {
        messageBox.classList.add('bg-green-500', 'text-white');
        messageBox.textContent = `✅ Successfully bypassed ${successCount} of ${urls.length} URL(s).`;
    } else {
        messageBox.classList.add('bg-red-500', 'text-white');
        messageBox.textContent = "⚠️ No valid Pixeldrain URLs found.";
    }

    outputContainer.classList.remove('hidden');
    outputContainer.scrollIntoView({ behavior: "smooth" });
    buttonText.textContent = 'Bypass';
    spinner.classList.add('hidden');
    bypassButton.disabled = false;
}