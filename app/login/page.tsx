// app/login/page.tsx
import { GoogleSignInButton } from "@/components/auth/GoogleSigninButton";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <div className={styles.login_wrap}>
      <div className={styles.card}>
        <div className={styles.icon_wrap}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="11"
              width="18"
              height="11"
              rx="2"
              stroke="#22d3ee"
              strokeWidth="1.5"
            />
            <path
              d="M7 11V7a5 5 0 0 1 10 0v4"
              stroke="#22d3ee"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="12" cy="16" r="1.5" fill="#22d3ee" />
          </svg>
        </div>

        <div style={{ textAlign: "center" }}>
          <span className={styles.badge}>
            <svg width="8" height="8" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="4" fill="#22d3ee" />
            </svg>
            Accès sécurisé
          </span>
        </div>

        <h1>Administration</h1>

        <p>
          Connectez-vous avec votre compte Google pour accéder au tableau de
          bord.
        </p>

        <div className={styles.btn_container}>
          <GoogleSignInButton />
        </div>

        <p className={styles.footer_text}>
          Accès réservé à l&apos;administrateur
        </p>
      </div>
    </div>
  );
}
