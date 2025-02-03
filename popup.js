document.getElementById("importBookmarks").addEventListener("click", () => {
    console.log("Import button clicked");

    // Fetch existing bookmarks in Firefox
    browser.bookmarks.getTree().then((tree) => {
        console.log("Bookmarks tree fetched successfully");

        let existingBookmarks = []; // Store existing bookmarks URLs

        // Traverse the tree to collect existing bookmark URLs
        function traverseBookmarks(bookmarkNode) {
            if (bookmarkNode.url) {
                existingBookmarks.push(bookmarkNode.url);
            } else if (bookmarkNode.children) {
                bookmarkNode.children.forEach(child => traverseBookmarks(child));
            }
        }

        tree.forEach(bookmark => traverseBookmarks(bookmark));
        console.log("Existing bookmarks fetched:", existingBookmarks);

        // Automatically create file input element
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".html";

        // This will automatically open the file dialog, but the user will still need to choose the file
        input.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (!file) {
                console.error("No file selected");
                return;
            }

            console.log("File selected:", file.name);
            const reader = new FileReader();
            reader.onload = () => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(reader.result, "text/html");
                const links = doc.querySelectorAll("a");

                console.log("Parsing bookmarks...");
                links.forEach(link => {
                    const url = link.href;
                    if (!existingBookmarks.includes(url)) {
                        // Create the bookmark in Firefox if it's not already present
                        console.log("Adding bookmark:", link.innerText, url);
                        browser.bookmarks.create({
                            title: link.innerText,
                            url: url
                        }).then(() => {
                            console.log("Bookmark added successfully:", link.innerText, url);
                        }).catch((error) => {
                            console.error("Error adding bookmark:", error);
                        });
                    } else {
                        console.log("Skipping duplicate bookmark:", link.innerText, url);
                    }
                });

                alert("Bookmarks have been imported successfully!");
            };

            reader.readAsText(file);
        });

        input.click(); // Open the file picker dialog
    }).catch((error) => {
        console.error("Error fetching bookmarks tree:", error);
    });
});