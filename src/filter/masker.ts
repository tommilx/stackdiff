export type MaskOptions = {
  /** Keys whose values should be masked */
  sensitiveKeys?: string[];
  /** Pattern matching keys whose values should be masked */
  sensitivePattern?: string | RegExp;
  /** Replacement string, defaults to '***' */
  maskChar?: string;
};

export type EnvMap = Record<string, string | undefined>;

const DEFAULT_SENSITIVE_PATTERN = /(?:SECRET|PASSWORD|TOKEN|KEY|PRIVATE|CREDENTIAL)/i;
const DEFAULT_MASK = '***';

export function maskEnv(env: EnvMap, options: MaskOptions = {}): EnvMap {
  const {
    sensitiveKeys = [],
    sensitivePattern = DEFAULT_SENSITIVE_PATTERN,
    maskChar = DEFAULT_MASK,
  } = options;

  const regex =
    typeof sensitivePattern === 'string'
      ? new RegExp(sensitivePattern, 'i')
      : sensitivePattern;

  return Object.fromEntries(
    Object.entries(env).map(([k, v]) => {
      const isSensitive = sensitiveKeys.includes(k) || regex.test(k);
      return [k, isSensitive ? maskChar : v];
    })
  );
}

export function isSensitiveKey(
  key: string,
  options: Pick<MaskOptions, 'sensitiveKeys' | 'sensitivePattern'> = {}
): boolean {
  const { sensitiveKeys = [], sensitivePattern = DEFAULT_SENSITIVE_PATTERN } = options;
  const regex =
    typeof sensitivePattern === 'string'
      ? new RegExp(sensitivePattern, 'i')
      : sensitivePattern;
  return sensitiveKeys.includes(key) || regex.test(key);
}
