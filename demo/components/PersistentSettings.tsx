import React from 'react';
import { Card, Button, Space, Typography, Divider } from 'antd';
import { useGlobalState } from '../../src/index';

const { Text } = Typography;

type Settings = {
  theme: 'light' | 'dark';
  language: 'en' | 'zh';
  notifications: boolean;
};

const initialSettings: Settings = {
  theme: 'light',
  language: 'en',
  notifications: true,
};

const PersistentSettings: React.FC = () => {
  const [settings, setSettings] = useGlobalState<Settings>(
    'app-settings',
    initialSettings,
    { storage: 'localStorage', storageKey: 'demo-app' }
  );

  return (
    <Card
      title="Persistent Settings (localStorage)"
      className="use-global-state-example__card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          🔄 These settings persist across page refreshes
        </Text>
        <Divider />
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Theme: </Text>
            <Space>
              <Button
                type={settings.theme === 'light' ? 'primary' : undefined}
                onClick={() => setSettings({ theme: 'light' })}
              >
                Light
              </Button>
              <Button
                type={settings.theme === 'dark' ? 'primary' : undefined}
                onClick={() => setSettings({ theme: 'dark' })}
              >
                Dark
              </Button>
            </Space>
          </div>
          <div>
            <Text strong>Language: </Text>
            <Space>
              <Button
                type={settings.language === 'en' ? 'primary' : undefined}
                onClick={() => setSettings({ language: 'en' })}
              >
                English
              </Button>
              <Button
                type={settings.language === 'zh' ? 'primary' : undefined}
                onClick={() => setSettings({ language: 'zh' })}
              >
                中文
              </Button>
            </Space>
          </div>
          <div>
            <Text strong>Notifications: </Text>
            <Button
              type={settings.notifications ? 'primary' : undefined}
              onClick={() =>
                setSettings({ notifications: !settings.notifications })
              }
            >
              {settings.notifications ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </Space>
        <Divider />
        <Text strong>Current Settings:</Text>
        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
          {JSON.stringify(settings, null, 2)}
        </pre>
      </Space>
    </Card>
  );
};

export default PersistentSettings;
