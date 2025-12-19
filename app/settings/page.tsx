/**
 * SETTINGS PAGE
 * ==============
 * User settings including connected integrations.
 *
 * @created 2025-12-19 - Google Docs export feature
 */

import { ConnectedAppsSection } from './connected-apps-section';

export default function SettingsPage() {
  return (
    <div className="container max-w-2xl py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and connected apps.
          </p>
        </div>

        <div className="space-y-6">
          {/* Connected Apps Section */}
          <ConnectedAppsSection />
        </div>
      </div>
    </div>
  );
}
