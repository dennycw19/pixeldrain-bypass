async function generateBypass() {
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
    
    console.log("URL Input:", urlInput);
    console.log("Parsed URLs:", urls);

    buttonText.textContent = 'Bypassing...';
    spinner.classList.remove('hidden');
    bypassButton.disabled = true;
    outputContainer.classList.add('hidden');
    messageBox.className = "p-3 rounded text-sm font-semibold text-center";
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
    console.log("Number of URLs to process:", urls.length);
    let successCount = 0;

    for (const url of urls){
        console.log("Processing URL:", url);
        try{
            const response = await fetch("./php/bypass.php", {
                method: "POST",
                headers:{"Content-Type": "application/json"},
                body: JSON.stringify({url}),
            });
            if(response.ok) console.log("Successfully fetched bypass data for URL:", url);
            // Check if the response is ok (status in the range 200-299)
            if (!response.ok) console.error("Failed to fetch bypass data for URL:", url, "Status:", response.status);

            const result = await response.json();
            console.log("Result for URL:", url, "is", result);

            const viewer = result.viewerData;

            console.log("Viewer Data:", viewer.type, viewer.api_response);

            if(viewer.type === "list"){
                const {files, title} = viewer.api_response;
                console.log("Bypassed URLs:", files);
                console.log("Title:", title);
                resultContainer.innerHTML += `
                    <div class="mb-6">
                    <h2 class="text-lg font-semibold text-white">${title} Bypassed URLs:</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${files.map((file) => `
                            <div class="bg-gray-800 p-4 rounded-md">
                                <h3 class="text-lg font-semibold text-white">${file.name}</h3>
                                <p class="text-gray-400">Size: ${file.size} bytes</p>
                                <a href="${file.url}" class="text-blue-400 hover:underline">Download</a>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
                successCount++;
            } else if(viewer.type === "file"){
                const file = viewer.api_response;
                resultContainer.innerHTML += `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="p-4 bg-gray-800 rounded-md">
                        <p class="text-sm font-semibold text-white">${file.name}</p>
                        <p class="text-gray-400">Size: ${file.size} bytes</p>
                        <a href="${file.url}" class="text-blue-400 hover:underline">Download</a>
                    </div>
                </div>`;
                successCount++;
            }
        } catch (error) {
            console.error("Error processing URL:", url, error);
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