import { Bell, Globe, Moon, User, Shield, LogOut } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

export function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Preferences"
        subtitle="Adjust your study experience. Changes here are stored on this device."
      />

      <div className="space-y-6 max-w-2xl">
        <SettingsSection icon={<User className="w-4 h-4" />} title="Profile">
          <Field label="Display name" value="Student" />
          <Field label="Email" value="student@mymwalimu.app" />
          <Field label="Exam target date" value="2026-12-01" type="date" />
        </SettingsSection>

        <SettingsSection icon={<Bell className="w-4 h-4" />} title="Notifications">
          <Toggle label="Daily study reminder" enabled />
          <Toggle label="Streak alerts" enabled />
          <Toggle label="New content updates" enabled={false} />
        </SettingsSection>

        <SettingsSection icon={<Globe className="w-4 h-4" />} title="Appearance">
          <Toggle icon={<Moon className="w-4 h-4" />} label="Dark mode" enabled={false} />
          <Field label="Language" value="English" />
        </SettingsSection>

        <SettingsSection icon={<Shield className="w-4 h-4" />} title="Account">
          <button className="btn-secondary w-full sm:w-auto">
            Change password
          </button>
          <button className="btn w-full sm:w-auto px-4 py-2.5 text-sm text-error-600 hover:bg-error-50 border border-error-200 rounded-lg">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </SettingsSection>
      </div>
    </>
  );
}

function SettingsSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 text-primary-700">
          {icon}
        </span>
        <h2 className="font-bold text-ink-900">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, type = 'text' }: { label: string; value: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-500 mb-1.5">{label}</label>
      <input className="input" type={type} defaultValue={value} />
    </div>
  );
}

function Toggle({
  label,
  enabled,
  icon,
}: {
  label: string;
  enabled: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="flex items-center gap-2 text-sm font-medium text-ink-700">
        {icon}
        {label}
      </span>
      <span className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-primary-600' : 'bg-ink-200'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
      </span>
    </label>
  );
}
