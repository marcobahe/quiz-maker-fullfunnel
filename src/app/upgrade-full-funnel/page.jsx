// Redirect temporário enquanto a página Full Funnel dedicada não está pronta (ICO-170)
import { redirect } from 'next/navigation';

export default function UpgradeFullFunnel() {
  redirect('/pricing');
}
