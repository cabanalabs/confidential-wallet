import {forwardRef, useImperativeHandle, useState} from "react";
import {Button, Modal} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {useDebounceClick} from "../hooks/useDebounceClick.ts";

type Props = {
  title?: string,
  message: string,
  onConfirm?: () => Promise<void>,
  onCancel?: () => void,

}
export const ConfirmModal = forwardRef(({title, message, onCancel, onConfirm}: Props, ref) => {

  const [opened, { open: _open, close }] = useDisclosure(false);
  const [processing, setProcessing] = useState(false);
  const onClickConfirm = useDebounceClick(handleConfirm);

  useImperativeHandle(ref, () => ({
    open() {
      _open();
    }
  }));

  function handleConfirm() {
    setProcessing(true);
    onConfirm().finally(() => {
      setProcessing(false);
      close();
    });
  }

  function handleCancel() {
    if (onCancel) onCancel();
    close();
  }

  return (
    <Modal title={title} opened={opened} onClose={handleCancel} withCloseButton={true} closeOnClickOutside={false} size="auto" centered  overlayProps={{ color: '#101010', backgroundOpacity: 0.8 }}>
      <div className="flex flex-col justify-center items-center max-w-[390px] text-center p-8 rounded-3xl">
        <p className="mb-6">{message}</p>
        {onConfirm && (
          <div className="flex gap-4">
            <Button variant="outline" color="gray" onClick={handleCancel}>Cancel</Button>
            <Button variant="filled" color="red" loading={processing} onClick={onClickConfirm}>Confirm</Button>
          </div>
        )}
        {!onConfirm && (
          <Button variant="filled" color="blue" loading={processing} onClick={handleCancel}>Ok</Button>
        )}
      </div>
    </Modal>
  );
});