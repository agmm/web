import { observer } from 'mobx-react-lite';
import { FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import { TwoFactorAuth } from './model';
import { TwoFactorAuthView } from './TwoFactorAuthView';

export const TwoFactorAuthWrapper: FunctionComponent = () => {
  const [auth] = useState(() => new TwoFactorAuth());
  return <TwoFactorAuthView auth={auth} />;
};
