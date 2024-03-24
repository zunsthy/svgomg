import { FunctionComponent } from 'preact';
import {} from 'preact/hooks';
import { Signal, useComputed } from '@preact/signals';

import * as styles from './styles.module.css';
import { OptimizeConfig } from '../types';
import pluginData from 'virtual:svgo-plugin-data';
import CheckboxRow from './CheckboxRow';

interface Props {
  showOriginal: Signal<boolean>;
  optimizeConfig: OptimizeConfig;
  inputCompressedSize: Signal<number | null>;
  outputCompressedSize: Signal<number | null>;
}

const Config: FunctionComponent<Props> = ({
  optimizeConfig,
  showOriginal,
  inputCompressedSize,
  outputCompressedSize,
}) => {
  const percent = useComputed(() => {
    if (
      inputCompressedSize.value === null ||
      outputCompressedSize.value === null
    ) {
      return null;
    }

    return `${Math.round((outputCompressedSize.value / inputCompressedSize.value) * 100)}%`;
  });

  return (
    <div class={styles.config}>
      <div class={styles.inner}>
        <div class={styles.configScroller}>
          <form>
            <CheckboxRow text="Show Original" checked={showOriginal} />
            {Object.entries(optimizeConfig.plugins).map(([name, settings]) => (
              <CheckboxRow
                text={pluginData[name].title}
                checked={settings.enabled}
              />
            ))}
            <CheckboxRow
              text="Pretty"
              checked={optimizeConfig.pretty.enabled}
            />
          </form>
        </div>
        <div class={styles.results}>{percent}</div>
      </div>
    </div>
  );
};

export { Config as default };
