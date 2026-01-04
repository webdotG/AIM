// src/ui/components/auth/BackupCodeModal/BackupCodeModal.jsx
import React, { useState } from 'react';
import { useLanguage } from '@/layers/language';
import Modal from '@/ui/components/common/Modal/Modal';
import Button from '@/ui/components/common/Button/Button';
import './BackupCodeModal.css';

export default function BackupCodeModal({ 
  isOpen,
  onClose,
  backupCode,
  title = null,
  warning = null,
  instructions = null,
  showCopyButton = true,
  showCloseButton = true
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(backupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Кастомный footer с кнопкой копирования
  const footer = (
    <div style={{ 
      display: 'flex', 
      gap: '12px', 
      justifyContent: 'flex-end',
      width: '100%'
    }}>
      {showCopyButton && (
        <Button
          type="button"
          variant="secondary"
          onClick={handleCopy}
        >
          {copied ? '✓ ' + t('auth.backup_code.copied') : t('auth.backup_code.copy')}
        </Button>
      )}
      <Button
        type="button"
        variant="primary"
        onClick={onClose}
      >
        {t('auth.backup_code.understood')}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || t('auth.backup_code.title')}
      footer={footer}
      size="md"
      hideFooter={false}
      closeOnOverlay={false}
      disableEscapeClose={true}
    >
      <div className="backup-code-modal-content">
        {warning && (
          <div className="backup-warning">
            {warning || t('auth.backup_code.warning')}
          </div>
        )}

        <div className="backup-code-display">
          <code className="backup-code-text">
            {backupCode}
          </code>
          <div className="backup-code-hint">
            {t('auth.backup_code.click_to_copy')}
          </div>
        </div>

        {instructions ? (
          <div className="backup-code-instructions">
            {instructions}
          </div>
        ) : (
          <div className="backup-code-instructions">
            <p>{t('auth.backup_code.instruction1')}</p>
            <p>{t('auth.backup_code.instruction2')}</p>
            <p>{t('auth.backup_code.instruction3')}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
