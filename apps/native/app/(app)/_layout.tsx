import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function AppLayout() {
  return (
    <NativeTabs tintColor="#c23326">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md="home"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="manual">
        <NativeTabs.Trigger.Label>Create</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="plus.circle.fill" md="add_circle" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="files">
        <NativeTabs.Trigger.Label>Files</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'folder', selected: 'folder.fill' }}
          md="folder"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.circle', selected: 'person.circle.fill' }}
          md="person"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
