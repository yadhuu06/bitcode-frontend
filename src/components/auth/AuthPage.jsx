import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useAuth } from "../../context/AuthContext"; 
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AuthPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const myRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = user?.is_superuser ? "/admin/dashboard" : "/user/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const accessToken = query.get("access_token");
    const refreshToken = query.get("refresh_token");

    if (accessToken && refreshToken) {
      Cookies.set("access_token", accessToken, { secure: true, sameSite: 'Strict', expires: 7 });
      Cookies.set("refresh_token", refreshToken, { secure: true, sameSite: 'Strict', expires: 7 });
      const role = query.get("role") || "user";
      Cookies.set("role", role, { secure: true, sameSite: 'Strict', expires: 7 });

      if (role === "admin") {
        toast.info("You are an admin, please login as admin.");
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        Cookies.remove("role");
        navigate("/admin_login", { replace: true });
      } else {
        toast.success("Google login successful!");
        Cookies.remove("authPageState");
        const path = location.pathname || "/user/dashboard";
        navigate(path, { replace: true });
      }
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!vantaEffect && myRef.current && typeof NET !== "undefined") {
      const originalLineMethod = THREE.Line.prototype.computeLineDistances;
      THREE.Line.prototype.computeLineDistances = function () {
        const result = originalLineMethod.apply(this, arguments);
        if (this.material && !this.material._hasBeenUpdated) {
          if (this.material.color) {
            this.material.color.set(0x00ff00);
          }
          this.material.transparent = true;
          this.material.opacity = 0.5;
          this.material.color = new THREE.Color(0x000000);
          this.material.blending = THREE.NormalBlending;
          this.material.blurRadius = 15;
          this.material.depthWrite = false;
          this.material._hasBeenUpdated = true;
        }
        return result;
      };

      const effect = NET({
        el: myRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x00ff00,
        backgroundColor: 0x000000,
        points: 12.0,
        maxDistance: 20.0,
        spacing: 15.0,
        showDots: true,
        thickness: 3.0,
        lineColor: 0x00ff00,
        highlightColor: 0x00ff00,
        midtoneColor: 0x00ff00,
        lowlightColor: 0x008000,
        forceAnimate: true,
      });

      if (myRef.current) {
        myRef.current.style.filter = "blur(.25px)";
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
        overlay.style.zIndex = "0";
        document.body.appendChild(overlay);

        const content = document.querySelector(".your-content-container");
        if (content) {
          content.style.position = "relative";
          content.style.zIndex = "1";
        }
      }

      if (effect && effect.scene) {
        effect.scene.traverse((object) => {
          if (object instanceof THREE.Line && object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => {
                if (mat.color) mat.color.set(0x00ff00);
                mat.transparent = true;
                mat.opacity = 0.45;
              });
            } else if (object.material.color) {
              object.material.color.set(0x00ff00);
              object.material.transparent = true;
              object.material.opacity = 0.45;
            }
          }
        });
      }

      setVantaEffect(effect);
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    Cookies.remove("authPageState");
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(10, 10, 10, 0.08)",
          zIndex: 1,
        }}
      />
      <div
        ref={myRef}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
      />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-20">
        <div className="text-left flex items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-white">{"<"}</span>
            <span className="text-white">Bit </span>
            <span className="text-green-500">Code</span>
            <span className="text-white">{">"}</span>
            <div className="text-xs text-green-500 ml-2">01010101</div>
          </h1>
        </div>
        <button
          onClick={handleModeSwitch}
          className="text-white hover:text-green-500 transition-colors"
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </div>
      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-black bg-opacity-40 rounded-lg shadow-xl border border-gray-800">
        {isLogin ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
};

export default AuthPage;