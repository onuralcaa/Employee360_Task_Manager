import "./PersonelPage.css";

function PersonelPage() {
  const parseJwt = (token) => {
    try {
      return JSON.parse(window.atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };
  const token = localStorage.getItem("token");
  const decoded = token ? parseJwt(token) : null;
  const userName = decoded && decoded.name ? decoded.name : "Kullanıcı";

  return (
    <div className="personel-page-container">
      <h1>Hoşgeldiniz, {userName}!</h1>
    </div>
  );
}

export default PersonelPage;