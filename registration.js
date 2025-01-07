const registrationForm = {
    init() {
      const loginModal = document.createElement('div');
      loginModal.id = 'registrationModal';
      loginModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50';
      
      loginModal.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
          <h3 class="text-xl font-bold mb-4 text-center">Registration</h3>
          <form id="registration-form">
            <div class="mb-4">
              <label for="name" class="block text-sm font-semibold text-gray-600">Full Name</label>
              <input type="text" id="name" name="name" required
                class="w-full p-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="mb-4">
              <label for="location" class="block text-sm font-semibold text-gray-600">Location</label>
              <input type="text" id="location" name="location" required
                class="w-full p-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="mb-4">
              <label for="phone" class="block text-sm font-semibold text-gray-600">Phone Number</label>
              <input type="tel" id="phone" name="phone" required
                class="w-full p-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="mb-4">
              <label for="grade" class="block text-sm font-semibold text-gray-600">Grade</label>
              <select id="grade" name="grade" required
                class="w-full p-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Grade</option>
                <option value="1">Grade 1</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
              </select>
            </div>
            <button type="submit"
              class="w-full bg-blue-500 text-white py-3 rounded-md font-semibold hover:bg-blue-600 transition duration-300">
              Register
            </button>
          </form>
        </div>
      `;
  
      document.body.appendChild(loginModal);
      this.bindEvents();
    },
  
    bindEvents() {
        const form = document.getElementById('registration-form');
        form.addEventListener('submit', this.handleRegistration.bind(this));
    },

    async handleRegistration(event) {
        event.preventDefault();
        
        try {
            const form = event.target;
            const submitButton = form.querySelector('button[type="submit"]');
            
            // Disable the submit button to prevent double submission
            submitButton.disabled = true;
            submitButton.textContent = 'Registering...';
            
            const formData = new FormData(form);
            const userData = {
                name: formData.get('name'),
                location: formData.get('location'),
                phone: formData.get('phone'),
                grade: formData.get('grade'),
                hostToken: this.generateToken(),
                iframeUserId: this.generateiframeUserId()
            };

            // Register user
            const registrationResponse = await this.registerUser(userData);
            
            if (registrationResponse.success) {
                // Store tokens in localStorage
                localStorage.setItem('hostToken', userData.hostToken);
                localStorage.setItem('iframeUserId', userData.iframeUserId);
                
                // Initialize iframe communication
                this.initializeIframeCommunication(userData);
                
                // Hide the registration modal
                document.getElementById('registrationModal').style.display = 'none';
                
                // Show success message
                alert('Registration successful!');
            } else {
                throw new Error(registrationResponse.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert(`Registration failed: ${error.message}`);
        } finally {
            // Re-enable the submit button
            const submitButton = event.target.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Register';
        }
    },

    generateToken() {
        return 'host_' + Math.random().toString(36).substr(2, 9) + Date.now();
    },

    generateiframeUserId() {
        return 'iframe_' + Math.random().toString(36).substr(2, 9) + Date.now();
    },

    async registerUser(userData) {
        try {
            const response = await fetch('/api/regestration.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Registration fetch error:', error);
            throw new Error('Registration failed. Please try again.');
        }
    },

    initializeIframeCommunication(userData) {
        const iframe = document.getElementById('iframe');
        
        if (!iframe) {
            console.error('Iframe not found');
            return;
        }
        
        // Wait for iframe to load
        iframe.addEventListener('load', () => {
            try {
                // Send user data to child domain
                iframe.contentWindow.postMessage({
                    type: 'USER_REGISTRATION',
                    data: {
                        name: userData.name,
                        iframeUserId: userData.iframeUserId
                    }
                }, 'https://checheafrica.com/');
            } catch (error) {
                console.error('Error sending postMessage:', error);
            }
        });

        // Listen for messages from child domain
        window.addEventListener('message', (event) => {
            if (event.origin !== 'https://checheafrica.com/') return;

            switch (event.data.type) {
                case 'USER_EXISTS':
                    // Redirect to existing user account
                    iframe.src = event.data.redirectUrl;
                    break;
                    
                case 'USER_CREATED':
                    // New user account created
                    iframe.src = event.data.redirectUrl;
                    break;
                    
                case 'ERROR':
                    console.error('Error from child domain:', event.data.message);
                    break;
            }
        });
    }
};

// Initialize the registration system
document.addEventListener('DOMContentLoaded', () => {
    registrationForm.init();
});