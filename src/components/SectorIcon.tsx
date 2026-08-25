import React from 'react';
import {
  UtensilsCrossed,
  ChefHat,
  Wine,
  Sparkles,
  Boxes,
  Store,
  ShieldCheck,
  Coffee,
  Flame,
  CheckSquare,
  Refrigerator,
  Layers,
  LucideProps,
} from 'lucide-react';

interface SectorIconProps extends LucideProps {
  name: string;
}

export const SectorIcon: React.FC<SectorIconProps> = ({ name, ...props }) => {
  switch (name?.toLowerCase()) {
    case 'utensilscrossed':
    case 'salao':
    case 'garcom':
    case 'garcons':
      return <UtensilsCrossed {...props} />;
    case 'chefhat':
    case 'cozinha':
    case 'cozinheiras':
      return <ChefHat {...props} />;
    case 'wine':
    case 'bar':
    case 'bebidas':
      return <Wine {...props} />;
    case 'sparkles':
    case 'limpeza':
    case 'fechamento':
      return <Sparkles {...props} />;
    case 'boxes':
    case 'estoque':
      return <Boxes {...props} />;
    case 'store':
    case 'caixa':
    case 'recepcao':
      return <Store {...props} />;
    case 'coffee':
    case 'cafe':
      return <Coffee {...props} />;
    case 'flame':
    case 'chapa':
      return <Flame {...props} />;
    case 'refrigerator':
    case 'camarafria':
      return <Refrigerator {...props} />;
    case 'shieldcheck':
    case 'seguranca':
      return <ShieldCheck {...props} />;
    default:
      return <CheckSquare {...props} />;
  }
};
