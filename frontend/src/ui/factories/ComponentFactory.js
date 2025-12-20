// src/ui/factories/ComponentFactory.js
import { usePlatform } from '@/layers/platform';

// Импорт всех компонентов
import WebButton from '../components/common/Button/Button';
import TelegramButton from '../components/telegram/Button/TelegramButton';
import WebInput from '../components/common/Input/Input';
import TelegramInput from '../components/telegram/Input/TelegramInput';
import WebModal from '../components/common/Modal/Modal';
import TelegramModal from '../components/telegram/Modal/TelegramModal';

export const createComponent = (ComponentMap) => {
  return function PlatformComponent(props) {
    const { platform } = usePlatform();
    const Component = ComponentMap[platform] || ComponentMap.default;
    return <Component {...props} />;
  };
};

// Конкретные фабрики компонентов
export const createButton = () => createComponent({
  web: WebButton,
  telegram: TelegramButton,
  default: WebButton
});

export const createInput = () => createComponent({
  web: WebInput,
  telegram: TelegramInput,
  default: WebInput
});

export const createModal = () => createComponent({
  web: WebModal,
  telegram: TelegramModal,
  default: WebModal
});

// Экспорт готовых компонентов
export const Button = createButton();
export const Input = createInput();
export const Modal = createModal();