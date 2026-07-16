"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  signInWithEmail,
  signUpWithEmail,
  sendPhoneOtp,
  verifyPhoneOtp,
  type AuthResult,
} from "./actions";
import { GoogleButton } from "./GoogleButton";
import { useT } from "@/i18n/provider";
import type { UserRole } from "@/lib/types";

const EMPTY: AuthResult = { ok: false };

type Mode = "login" | "register";
type Method = "email" | "phone";

export function AuthCard({ mode }: { mode: Mode }) {
  const t = useT();
  const [method, setMethod] = useState<Method>("email");
  // Registration role bucket: supply side (MANAGER) vs demand side (ORGANIZER).
  const [role, setRole] = useState<UserRole>("MANAGER");

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-ink">
          {mode === "login" ? t.auth.loginTitle : t.auth.registerTitle}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "login" ? t.auth.loginSubtitle : t.auth.registerSubtitle}
        </p>

        {mode === "register" && <RolePicker role={role} onChange={setRole} />}

        {/* Method tabs */}
        <div className="mt-6 grid grid-cols-2 gap-1 rounded-[12px] bg-surface-2 p-1">
          <TabButton active={method === "email"} onClick={() => setMethod("email")}>
            {t.auth.tabEmail}
          </TabButton>
          <TabButton active={method === "phone"} onClick={() => setMethod("phone")}>
            {t.auth.tabPhone}
          </TabButton>
        </div>

        <div className="mt-5">
          {method === "email" ? (
            <EmailForm mode={mode} role={role} />
          ) : (
            <PhoneForm mode={mode} role={role} />
          )}
        </div>

        {/* Google shown only when configured (NEXT_PUBLIC_GOOGLE_ENABLED=true) */}
        {process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true" && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-line" />
              {t.auth.or}
              <span className="h-px flex-1 bg-line" />
            </div>

            <GoogleButton role={role} />
          </>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          {mode === "login" ? (
            <>
              {t.auth.noAccount}{" "}
              <Link href="/registracija" className="font-semibold text-accent">
                {t.auth.goRegister}
              </Link>
            </>
          ) : (
            <>
              {t.auth.haveAccount}{" "}
              <Link href="/prijava" className="font-semibold text-accent">
                {t.auth.goLogin}
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function RolePicker({
  role,
  onChange,
}: {
  role: UserRole;
  onChange: (r: UserRole) => void;
}) {
  const t = useT();
  return (
    <div className="mt-6">
      <span className="label">{t.auth.whoAreYou}</span>
      <div className="grid grid-cols-2 gap-2">
        <RoleOption
          active={role === "MANAGER"}
          onClick={() => onChange("MANAGER")}
          title={t.auth.roleSupplyTitle}
          sub={t.auth.roleSupplySub}
        />
        <RoleOption
          active={role === "ORGANIZER"}
          onClick={() => onChange("ORGANIZER")}
          title={t.auth.roleOrganizerTitle}
          sub={t.auth.roleOrganizerSub}
        />
      </div>
    </div>
  );
}

function RoleOption({
  active,
  onClick,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[12px] border p-3 text-left transition-colors ${
        active
          ? "border-accent bg-accent-soft"
          : "border-line-2 bg-surface hover:bg-surface-2"
      }`}
    >
      <div className="text-sm font-semibold text-ink">{title}</div>
      <div className="text-xs text-muted">{sub}</div>
    </button>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[9px] py-2 text-sm font-semibold transition-colors ${
        active ? "bg-surface text-ink shadow-soft" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function EmailForm({ mode, role }: { mode: Mode; role: UserRole }) {
  const t = useT();
  const action = mode === "login" ? signInWithEmail : signUpWithEmail;
  const [state, formAction, pending] = useActionState(action, EMPTY);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="role" value={role} />
      {mode === "register" && (
        <div>
          <label className="label" htmlFor="name">
            {t.auth.nameLabel}
          </label>
          <input id="name" name="name" className="input" placeholder={t.auth.namePlaceholder} />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">
          {t.auth.emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          placeholder="ime@primer.com"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="label" htmlFor="password">
          {t.auth.passwordLabel}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          placeholder="••••••••"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>
      {state.error && <p className="text-sm text-coral">{state.error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? t.common.loading : mode === "login" ? t.auth.doLogin : t.auth.doRegister}
      </button>
    </form>
  );
}

function PhoneForm({ mode, role }: { mode: Mode; role: UserRole }) {
  const t = useT();
  const [sendState, sendAction, sending] = useActionState(sendPhoneOtp, EMPTY);
  const [verifyState, verifyAction, verifying] = useActionState(verifyPhoneOtp, EMPTY);
  const [phone, setPhone] = useState("");

  const atCodeStep = sendState.step === "code";

  return (
    <div className="space-y-4">
      {!atCodeStep ? (
        <form action={sendAction} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="label" htmlFor="pname">
                {t.auth.nameLabel}
              </label>
              <input id="pname" name="name" className="input" placeholder={t.auth.namePlaceholder} />
            </div>
          )}
          <div>
            <label className="label" htmlFor="phone">
              {t.auth.phoneLabel}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="input"
              placeholder="+3816..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          {sendState.error && <p className="text-sm text-coral">{sendState.error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={sending}>
            {sending ? t.auth.sendingCode : t.auth.sendCode}
          </button>
          <p className="text-center text-xs text-muted">{t.auth.devOtpNote}</p>
        </form>
      ) : (
        <form action={verifyAction} className="space-y-4">
          <input type="hidden" name="phone" value={phone} />
          <input type="hidden" name="role" value={role} />
          <div>
            <label className="label" htmlFor="token">
              {t.auth.codeLabel}
            </label>
            <input
              id="token"
              name="token"
              inputMode="numeric"
              className="input tracking-[0.4em] text-center"
              placeholder="123456"
              maxLength={6}
            />
            <p className="mt-1.5 text-xs text-muted">
              {t.auth.sentTo} {phone}
            </p>
          </div>
          {verifyState.error && <p className="text-sm text-coral">{verifyState.error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={verifying}>
            {verifying ? t.auth.verifying : t.auth.verifyCode}
          </button>
        </form>
      )}
    </div>
  );
}
