import "./Login.css";

export default function Login({ onLogin }) {
  const handleLoginpage = () => {
    window.location.href = "http://localhost:3000/login";
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>RIMEX</h1>
        <p>Building better wheels</p>

        <button onClick={handleLoginpage}>Login </button>
      </div>
    </div>
  );
}
