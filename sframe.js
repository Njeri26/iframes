const iframeContainer = document.getElementById('iframe-container');
const iframeIcon = document.getElementById('iframe-icon');
const closeIframe = document.getElementById('close-iframe');
const iframe = document.getElementById('iframe');

// Store the current iframe URL and state in session storage
let currentIframeUrl = sessionStorage.getItem('iframeUrl') || 'https://www.esomakids.com/edtech';
let isIframeOpen = sessionStorage.getItem('isIframeOpen') === 'true';

// Function to handle user authentication
async function authenticateUser(hostingUserId, childName) {
    try {
        const response = await fetch('index.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                hostingUserId: hostingUserId,
                childName: childName
            })
        });

        const data = await response.json();
        
        if (data.redirectUrl) {
            updateIframeUrl(data.redirectUrl);
            return data;
        }
    } catch (error) {
        console.error('Authentication failed:', error);
        return null;
    }
}

// Update iframe URL and state in session storage
function updateIframeUrl(url) {
    currentIframeUrl = url;
    sessionStorage.setItem('iframeUrl', url);
    sessionStorage.setItem('isIframeOpen', 'true');
    iframe.src = url;
}

// Handle iframe opening with authentication
iframeIcon.addEventListener('click', async function () {
   
    const hostingUserId = 'userid-1';
    const childName = 'John'; 
    
    // Authenticate user before showing iframe
    const authResult = await authenticateUser(hostingUserId, childName);
    
    if (authResult) {
        iframeContainer.style.display = 'flex';
        iframe.addEventListener('load', function() {
            try {
                const iframeWindow = iframe.contentWindow;
                
                if (iframeWindow.location.href !== currentIframeUrl) {
                    updateIframeUrl(iframeWindow.location.href);
                }
                
                iframeWindow.parent = iframeWindow;
                iframeWindow.top = iframeWindow;
                
                iframeWindow.onbeforeunload = function() {
                    return undefined;
                };
            } catch (error) {
                console.warn('Could not modify iframe navigation:', error);
            }
        });
    }
});

// update iframe URL and state in session storage
function updateIframeUrl(url) {
    currentIframeUrl = url;
    sessionStorage.setItem('iframeUrl', url);
    sessionStorage.setItem('isIframeOpen', 'true');
    iframe.src = url;
}

// page refresh
function handlePageRefresh() {
    if (isIframeOpen) {
        iframeContainer.style.display = 'flex';
        iframe.src = currentIframeUrl;
    }
}

// Add event listener for page load to restore iframe state
window.addEventListener('load', handlePageRefresh);

// event to preserve state
window.addEventListener('beforeunload', function() {
    sessionStorage.setItem('isIframeOpen', iframeContainer.style.display === 'flex');
});

iframeIcon.addEventListener('click', function () {
    iframeContainer.style.display = 'flex';
    
    // If there's a stored URL, use it, otherwise use default
    iframe.src = currentIframeUrl;
    
 
    iframe.addEventListener('load', function() {
        try {
            const iframeWindow = iframe.contentWindow;
            
            // Store the new URL when navigation occurs
            if (iframeWindow.location.href !== currentIframeUrl) {
                updateIframeUrl(iframeWindow.location.href);
            }
            
            // Override navigation behavior
            iframeWindow.parent = iframeWindow;
            iframeWindow.top = iframeWindow;
            
            // Handle refresh events within iframe
            iframeWindow.onbeforeunload = function() {
                return undefined; // Allows refresh without prompting
            };
        } catch (error) {
            console.warn('Could not modify iframe navigation:', error);
        }
    });
});

// Close iframe modal when close button is clicked
closeIframe.addEventListener('click', function () {
    iframeContainer.style.display = 'none';
});

// Close iframe modal if clicked outside the iframe area
window.addEventListener('click', function (event) {
    if (event.target === iframeContainer) {
        iframeContainer.style.display = 'none';
    }
});

// Handle messages from iframe
window.addEventListener('message', function (event) {
    if (event.origin === "https://www.esomakids.com/edtech") {
        // Store authentication state if provided
        if (event.data.authState) {
            sessionStorage.setItem('authState', JSON.stringify(event.data.authState));
        }
        console.log("Received data from iframe:", event.data);
    }
});


iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-top-navigation allow-popups');
iframe.setAttribute('allow', 'fullscreen; autoplay; clipboard-write; encrypted-media');