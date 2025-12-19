/**
 * CONNECTED APPS SECTION
 * =======================
 * Settings section for managing third-party integrations.
 *
 * @created 2025-12-19 - Google Docs export feature
 */

'use client';

import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGoogleIntegration } from '@/hooks';
import { GoogleIcon } from '@/components/integrations';
import { formatRelativeTime } from '@/lib/utils/format';

export function ConnectedAppsSection() {
  const {
    isConnected,
    connectedEmail,
    connectedAt,
    isLoading,
    connect,
    isConnecting,
    disconnect,
    isDisconnecting,
  } = useGoogleIntegration();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Apps</CardTitle>
        <CardDescription>
          Manage your connected third-party services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Integration */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <GoogleIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Google</p>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : isConnected ? (
                <div className="text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    Connected as {connectedEmail}
                  </p>
                  {connectedAt && (
                    <p className="text-xs">
                      Connected {formatRelativeTime(connectedAt)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Connect to export docs to Google Drive
                </p>
              )}
            </div>
          </div>

          {isLoading ? (
            <Button variant="outline" size="sm" disabled>
              <Loader2 className="w-4 h-4 animate-spin" />
            </Button>
          ) : isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnect()}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                'Disconnect'
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => connect()}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          )}
        </div>

        {/* Placeholder for future integrations */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-dashed border-muted-foreground/25 opacity-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-lg">📝</span>
            </div>
            <div>
              <p className="font-medium">Notion</p>
              <p className="text-sm text-muted-foreground">
                Coming soon
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled>
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
