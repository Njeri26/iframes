const existingChildSiteUsers = [
    { username: 'john_doe', id: 101, name: 'John Doe', grade: 'Grade 4', town: 'Nairobi', password: 'password123' },
    // Add other users with their respective passwords for validation
];

const parentDatabase = []; // To store new user registrations

// Handle Login
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Check if user exists in child site database(id)
    const existingUser = existingChildSiteUsers.find((user) => user.username === username);

    if (existingUser) {
        // Validate the password
        if (existingUser.password === password) {
            // Save user details in session storage
            sessionStorage.setItem('authState', JSON.stringify(existingUser));
          //  alert('Login successful. You are recognized as an existing user in esomakids.com!');
            // Hide the login modal and show the main content
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
        } else {
            alert('Invalid password. Please try again.');
        }
    } else {
        // Simulate saving to parent database for new user
        parentDatabase.push({ username, password });
       // alert('Login successful. You are a new user. Please register in the child site if needed.');
        // Hide the login modal and show the main content
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
    }
});

// Handle Child Site Icon Click
const childSiteIcon = document.getElementById('child-site-icon');
childSiteIcon.addEventListener('click', function () {
    const authState = sessionStorage.getItem('authState');

    if (authState) {
        const userData = JSON.parse(authState);
        window.location.href = `https://www.esomakids.com/user?id=${userData.id}&name=${userData.name}`;
    } else {
        window.location.href = 'https://www.esomakids.com';
    }
});
