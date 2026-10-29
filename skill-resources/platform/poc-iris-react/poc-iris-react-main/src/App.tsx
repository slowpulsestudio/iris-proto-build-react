import { useRoute, type Route } from './lib/router.js';
import { UsersProvider } from './lib/usersStore.js';
import { DirectoryProvider } from './lib/directoryStore.js';
import { FIRST_NODE_ID } from './lib/directoryData.js';
import { AppShellProvider } from './lib/appShellContext.js';
import { useToastMessage } from './lib/toastStore.js';
import { CommandPalette } from './components/CommandPalette/CommandPalette.js';
import { Toast } from './components/Toast/Toast.js';
import { UsersPage } from './views/UsersPage/UsersPage.js';
import { UserDetailPage } from './views/UserDetailPage/UserDetailPage.js';
import { TreeListPage } from './views/TreeView/TreeListPage.js';
import { TreeDetailPage } from './views/TreeView/TreeDetailPage.js';
import { FavoritesPage } from './views/FavoritesView/FavoritesPage.js';
import { WipPage } from './views/WipPage/WipPage.js';
import { InsightsPage } from './views/InsightsPage/InsightsPage.js';
import { ServicesPage } from './views/ServicesPage/ServicesPage.js';
import { IdentityManagerPage } from './views/IdentityManagerPage/IdentityManagerPage.js';
import { IdentityInsightsPage } from './views/IdentityManagerPage/IdentityInsightsPage.js';
import { IdentityPlaceholder } from './views/IdentityManagerPage/IdentityPlaceholder.js';
import { IdentitySectionPage } from './views/IdentityManagerPage/IdentitySectionPage.js';
import { SafeguardPage } from './views/SafeguardPage/SafeguardPage.js';

function renderRoute(route: Route) {
  switch (route.name) {
    case 'userDetail':
      return <UserDetailPage userId={route.params.id} />;
    case 'usersList':
      return <UsersPage />;
    case 'treeRoot':
      return <TreeListPage nodeId={FIRST_NODE_ID} />;
    case 'treeList':
      return <TreeListPage nodeId={route.params.nodeId} />;
    case 'treeDetail':
      return <TreeDetailPage nodeId={route.params.nodeId} objectId={route.params.objectId} />;
    case 'favoritesList':
      return <FavoritesPage />;
    case 'groups':
      return <WipPage title="Groups" icon="UsersThree" />;
    case 'devices':
      return <WipPage title="Devices" icon="Devices" />;
    case 'agents':
      return <WipPage title="Agents" icon="Robot" />;
    case 'applications':
      return <WipPage title="Applications" icon="Browsers" />;
    case 'accessTemplates':
      return <WipPage title="Access templates" icon="UserCircleCheck" />;
    case 'managementUnits':
      return <WipPage title="Management units" icon="FolderSimpleStar" />;
    case 'insights':
      return <InsightsPage />;
    case 'services':
      return <ServicesPage />;
    case 'identityHome':
      return <IdentityManagerPage />;
    case 'identityInsights':
      return <IdentityInsightsPage />;
    case 'identitySettings':
      return (
        <IdentityPlaceholder title="Settings" icon="GearFine" activeItem="#/identity/settings" />
      );
    case 'identityHelp':
      return (
        <IdentityPlaceholder title="Help with" icon="Question" activeItem="#/identity/help" />
      );
    case 'identitySection':
      return <IdentitySectionPage groupId={route.params.group} itemValue={route.params.item} />;
    case 'safeguardHome':
      return <SafeguardPage />;
    default:
      return null;
  }
}

export default function App() {
  const route = useRoute();
  const toast = useToastMessage();
  return (
    <UsersProvider>
      <DirectoryProvider>
        <AppShellProvider>
          {renderRoute(route)}
          <CommandPalette />
          <Toast message={toast.message} onDismiss={toast.dismiss} />
        </AppShellProvider>
      </DirectoryProvider>
    </UsersProvider>
  );
}
