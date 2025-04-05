import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function PasswordToggle({ value, onChange, placeholder, name }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-container">
      <input
        name={name}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
      <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>
  );
}

export default PasswordToggle;