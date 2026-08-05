// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/* eslint-disable no-restricted-imports */
import { addons } from 'storybook/manager-api';

addons.register('iris-ui/auto-expand', () => {
  const channel = addons.getChannel();
  channel.once('setIndex', () => {
    channel.emit('storiesExpandAll');
  });
});
