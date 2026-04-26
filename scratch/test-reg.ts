async function testRegistration() {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test_robust@local.com',
      password: 'password123',
      displayName: 'Robust Tester',
      role: 'devotee'
    })
  });
  const data = await response.json();
  console.log('Registration Result:', data);
}

testRegistration();
