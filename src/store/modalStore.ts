import {
  action,
  makeAutoObservable,
  observable,
  configure,
  computed,
} from 'mobx';
import { ModalProps } from '@/components/modal/modal';

configure({ enforceActions: 'never' });

export interface NewModalProps<P> extends ModalProps {
  hidden: (props?: P) => void;
}

class ModalStore {
  currentModal: any = null;
  props: any = {};

  constructor() {
    makeAutoObservable(this);
  }

  @action
  open(ModalComponent: JSX.Element, props: any) {
    return new Promise((resolve) => {
      this.currentModal = ModalComponent;
      this.props = {
        ...props,
        isOpen: true,
        hidden: (params: any) => {
          this.currentModal = null;
          this.props = {};
          resolve(params || null);
        },
      };
    });
  }

  @action
  clear() {
    this.currentModal = null;
    this.props = {};
  }
}

const modalStore = new ModalStore();

export default modalStore;
