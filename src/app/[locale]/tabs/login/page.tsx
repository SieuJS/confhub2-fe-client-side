// ... các import khác nếu cần (ví dụ: React Router)

import LoginForm from "../../components/auth/LoginForm";

function App() {
  const handleLoginSuccess = () => {
    alert('Đăng nhập thành công!');
    // Chuyển hướng người dùng đến trang dashboard hoặc trang khác
    // Ví dụ: history.push('/dashboard'); (nếu bạn đang dùng React Router)
  };

  return (
    <div>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}

export default App;