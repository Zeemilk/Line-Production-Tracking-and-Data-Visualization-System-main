<?php
/**
 * In-memory mock data store for demo mode (no Oracle).
 * Mutable CRUD data persists to function/assets/demo_data/user_store.json
 */

require_once __DIR__ . '/demo_config.php';

class MockStore
{
    private static ?array $userStore = null;
    private static string $storePath;

    private static function storePath(): string
    {
        if (!isset(self::$storePath)) {
            self::$storePath = __DIR__ . '/demo_data/user_store.json';
        }
        return self::$storePath;
    }

    private static function loadUserStore(): array
    {
        if (self::$userStore !== null) {
            return self::$userStore;
        }
        $path = self::storePath();
        $dir = dirname($path);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        if (file_exists($path)) {
            $data = json_decode(file_get_contents($path), true);
            self::$userStore = is_array($data) ? $data : self::emptyUserStore();
        } else {
            self::$userStore = self::emptyUserStore();
        }
        return self::$userStore;
    }

    private static function saveUserStore(): void
    {
        $path = self::storePath();
        $dir = dirname($path);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        file_put_contents($path, json_encode(self::$userStore, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    private static function emptyUserStore(): array
    {
        return [
            'production_plan' => [],
            'wip_last_month' => [],
            'plan_deleted' => [],
            'wip_deleted' => [],
        ];
    }

    // ── Helpers ──────────────────────────────────────────────

    private static function normalizeProductTypeKey(string $key): string
    {
        $normalized = strtolower(trim($key));
        $normalized = str_replace([' ', '_', '-'], '', $normalized);
        return $normalized;
    }

    public static function productTypeLabel(string $key): string
    {
        $normalized = self::normalizeProductTypeKey($key);
        $map = [
            'typea' => 'Type A', 'typeb' => 'Type B', 'typec' => 'Type C',
            'typed' => 'Type D', 'typee' => 'Type E',
        ];
        return $map[$normalized] ?? 'Type A';
    }

    private static function linesForType(string $label): array
    {
        $prefix = substr($label, -1);
        return ["Line-{$prefix}01", "Line-{$prefix}02", "Line-{$prefix}03", "Line-{$prefix}04"];
    }

    private static function partsForType(string $label): array
    {
        $n = ord(substr($label, -1)) - ord('A') + 1;
        return [
            "PART-{$n}001", "PART-{$n}002", "PART-{$n}003",
            "PART-{$n}004", "PART-{$n}005", "PART-{$n}006",
        ];
    }

    private static function dateStr(int $offsetDays = 0): string
    {
        return date('Y-m-d', strtotime("$offsetDays days"));
    }

    private static function dateSlash(int $offsetDays = 0): string
    {
        return date('d/m/Y', strtotime("$offsetDays days"));
    }

    private static function planKey(array $row): string
    {
        $keys = ['create_type', 'datetime', 'line_name', 'type', 'product_type'];
        $parts = [];
        foreach ($keys as $k) {
            $parts[] = strtolower($row[$k] ?? $row[strtoupper($k)] ?? '');
        }
        return implode('|', $parts);
    }

    private static function wipKey(array $row): string
    {
        $my = $row['month_year'] ?? $row['MONTH_YEAR'] ?? '';
        $pt = $row['product_type'] ?? $row['PRODUCT_TYPE'] ?? '';
        return strtolower("$my|$pt");
    }

    // ── File-backed demo data loaders ────────────────────────

    private static function dataFilePath(string $fileName): string
    {
        return dirname(__DIR__, 2) . '/assets/etc/' . $fileName;
    }

    private static function readCsvRows(string $fileName): array
    {
        $path = self::dataFilePath($fileName);
        if (!file_exists($path)) {
            return [];
        }

        $rows = [];
        $handle = fopen($path, 'rb');
        if ($handle === false) {
            return [];
        }

        $header = null;
        while (($line = fgetcsv($handle)) !== false) {
            if ($line === [null] || count($line) === 0) {
                continue;
            }
            if ($header === null) {
                $header = array_map(function ($value) {
                    return trim($value, " \t\n\r\0\x0B\"\'");
                }, $line);
                continue;
            }

            $row = [];
            foreach ($header as $idx => $key) {
                $row[$key] = isset($line[$idx]) ? trim($line[$idx], " \t\n\r\0\x0B") : '';
            }
            $rows[] = $row;
        }

        fclose($handle);
        return $rows;
    }

    private static function parseDateValue(string $value): string
    {
        if ($value === '') {
            return '';
        }

        $formats = ['Y-m-d', 'd M Y', 'd/m/Y', 'd M Y H:i:s', 'Y-m-d H:i:s', 'Y/m/d', 'Y-m-d H:i:s.u'];
        foreach ($formats as $format) {
            $dt = DateTime::createFromFormat($format, $value);
            if ($dt && $dt->format($format) === $value) {
                return $dt->format('Y-m-d');
            }
        }

        $ts = strtotime($value);
        return $ts ? date('Y-m-d', $ts) : '';
    }

    private static function normalizeLineName(string $line): string
    {
        return trim(str_replace(['LINE ', 'Line '], 'Line ', $line));
    }

    private static function mapProductionPlanRows(array $rows): array
    {
        return array_map(function ($row) {
            $date = self::parseDateValue($row['DATETIME'] ?? $row['datetime'] ?? '');
            return [
                'CREATE_TYPE' => $row['CREATE_TYPE'] ?? $row['create_type'] ?? '0',
                'DATETIME' => $date,
                'QTY' => (string)($row['QTY'] ?? $row['qty'] ?? '0'),
                'TYPE' => $row['TYPE'] ?? $row['type'] ?? '',
                'LINE_NAME' => self::normalizeLineName($row['LINE_NAME'] ?? $row['line_name'] ?? ''),
                'PRODUCT_TYPE' => $row['PRODUCT_TYPE'] ?? $row['product_type'] ?? '',
                'EMPNO' => $row['EMPNO'] ?? $row['empno'] ?? '',
            ];
        }, $rows);
    }

    private static function mapCompletedLotRows(array $rows): array
    {
        return array_map(function ($row) {
            $date = self::parseDateValue($row['COMPLETION_PRASS_DATE'] ?? $row['completion_prass_date'] ?? '');
            $qty = (string)($row['WIP_QTY'] ?? $row['wip_qty'] ?? $row['INPUT_QTY'] ?? $row['input_qty'] ?? $row['QTY'] ?? $row['qty'] ?? '0');
            return [
                'COMPLETION_PRASS_DATE' => $date,
                'PARTNAME' => $row['PARTNAME'] ?? $row['partname'] ?? '',
                'LOTNO' => $row['LOTNO'] ?? $row['lotno'] ?? '',
                'LINE_NAME' => self::normalizeLineName($row['LINE_NAME'] ?? $row['line_name'] ?? ''),
                'TYPELOT' => $row['TYPELOT'] ?? $row['typelot'] ?? '',
                'QTY' => $qty,
                'WIP_QTY' => $qty,
                'PRODUCT_TYPE' => $row['PRODUCT_TYPE'] ?? $row['product_type'] ?? '',
            ];
        }, $rows);
    }

    private static function mapInputRows(array $rows): array
    {
        return array_map(function ($row) {
            $date = self::parseDateValue($row['COMPLETION_PRASS_DATE'] ?? $row['completion_prass_date'] ?? '');
            $qty = (string)($row['WIP_QTY'] ?? $row['wip_qty'] ?? $row['INPUT_QTY'] ?? $row['input_qty'] ?? $row['QTY'] ?? $row['qty'] ?? '0');
            return [
                'COMPLETION_PRASS_DATE' => $date,
                'LOTNO' => $row['LOTNO'] ?? $row['lotno'] ?? '',
                'LINE_NAME' => self::normalizeLineName($row['LINE_NAME'] ?? $row['line_name'] ?? ''),
                'PARTNAME' => $row['PARTNAME'] ?? $row['partname'] ?? '',
                'QTY' => $qty,
                'WIP_QTY' => $qty,
                'PRODUCT_TYPE' => $row['PRODUCT_TYPE'] ?? $row['product_type'] ?? '',
                'TYPELOT' => $row['TYPELOT'] ?? $row['typelot'] ?? '',
            ];
        }, $rows);
    }

    private static function mapWipRows(array $rows): array
    {
        return array_map(function ($row) {
            return [
                'INPUT_DATE' => self::parseDateValue($row['INPUT_DATE'] ?? $row['input_date'] ?? ''),
                'WIP_DATE' => self::parseDateValue($row['WIP_DATE'] ?? $row['wip_date'] ?? ''),
                'WIP_PROCESS_NAME' => $row['WIP_PROCESS_NAME'] ?? $row['wip_process_name'] ?? '',
                'LOT_STATUS' => $row['LOT_STATUS'] ?? $row['lot_status'] ?? '',
                'LINE_NAME' => self::normalizeLineName($row['LINE_NAME'] ?? $row['line_name'] ?? ''),
                'PARTNAME' => $row['PARTNAME'] ?? $row['partname'] ?? '',
                'LOTNO' => $row['LOTNO'] ?? $row['lotno'] ?? '',
                'WIP_QTY' => (string)($row['WIP_QTY'] ?? $row['wip_qty'] ?? '0'),
                'PRODUCT_TYPE' => $row['PRODUCT_TYPE'] ?? $row['product_type'] ?? '',
                'ITEMTYPECODE' => $row['ITEMTYPECODE'] ?? $row['itemtypecode'] ?? '',
                'PROCESS_TYPE' => $row['WIP_PROCESS_NAME'] ?? $row['process_type'] ?? '',
                'PROCESS_TYPE_NO' => $row['SEQ_NO'] ?? $row['process_type_no'] ?? '',
                'SEQ_NO' => $row['SEQ_NO'] ?? $row['seq_no'] ?? '',
                'TYPELOT' => $row['TYPELOT'] ?? $row['typelot'] ?? '',
            ];
        }, $rows);
    }

    private static function mapMachineStatusRows(array $rows): array
    {
        return array_map(function ($row) {
            return [
                'PROCESS' => $row['PROCESS'] ?? $row['process'] ?? '',
                'LINE_NAME' => self::normalizeLineName($row['LINE_NAME'] ?? $row['line_name'] ?? ''),
                'STATUS' => $row['STATUS'] ?? $row['status'] ?? '',
                'MC_NAME' => $row['MC_NAME'] ?? $row['mc_name'] ?? '',
                'PRODUCT_TYPE' => $row['PRODUCT_TYPE'] ?? $row['product_type'] ?? '',
            ];
        }, $rows);
    }

    private static function mapMcRecordRows(array $rows): array
    {
        return array_map(function ($row) {
            return [
                'DATETIME' => $row['DATETIME'] ?? $row['datetime'] ?? '',
                'DATETIMEFIN' => $row['DATETIMEFIN'] ?? $row['datetimefin'] ?? '',
                'FACNO' => $row['FACNO'] ?? $row['facno'] ?? '',
                'LINE_NAME' => self::normalizeLineName($row['LINE_NAME'] ?? $row['line_name'] ?? ''),
                'LINE' => $row['LINE_NAME'] ?? $row['line_name'] ?? '',
                'LOSSCODE' => $row['LOSSCODE'] ?? $row['losscode'] ?? '',
                'LOSS_NAME' => $row['LOSS_NAME'] ?? $row['loss_name'] ?? '',
                'MC_NAME' => $row['MC_NAME'] ?? $row['mc_name'] ?? '',
                'MC_TROUBLE' => $row['MC_TROUBLE'] ?? $row['mc_trouble'] ?? '',
                'MC_TYPE' => $row['MC_TYPE'] ?? $row['mc_type'] ?? '',
                'NAMEREQ' => $row['NAMEREQ'] ?? $row['namereq'] ?? '',
                'PROCESS' => $row['PROCESS'] ?? $row['process'] ?? '',
                'PRODUCT_TYPE' => $row['PRODUCT_TYPE'] ?? $row['product_type'] ?? '',
                'REMARK' => $row['REMARK'] ?? $row['remark'] ?? '',
                'SECTION' => $row['SECTION'] ?? $row['section'] ?? '',
                'TIMEREQ' => $row['TIMEREQ'] ?? $row['timereq'] ?? '',
                'TIME' => $row['TIME'] ?? $row['time'] ?? '',
                'TIMEFIN' => $row['TIMEFIN'] ?? $row['timefin'] ?? '',
                // Calculate TIMEMIN from TIME/TIMEFIN if not present
                'TIMEMIN' => self::computeTimeMinutes($row['TIME'] ?? $row['time'] ?? '', $row['TIMEFIN'] ?? $row['timefin'] ?? '', $row['TIMEMIN'] ?? $row['timemin'] ?? ''),
            ];
        }, $rows);
    }

    private static function computeTimeMinutes(string $time, string $timefin, $existing): string
    {
        // If existing TIMEMIN provided and non-empty, return it
        if ($existing !== null && $existing !== '') {
            return (string)$existing;
        }

        if (!$time || !$timefin) return '0';

        // Parse formats like '07:05', '07.05', '07:05:00'
        $parse = function($t) {
            if (preg_match('/^(\d{1,2})[:.](\d{2})/', trim($t), $m)) {
                $h = (int)$m[1];
                $mi = (int)$m[2];
                return $h * 60 + $mi;
            }
            return null;
        };

        $t1 = $parse($time);
        $t2 = $parse($timefin);
        if ($t1 === null || $t2 === null) return '0';

        $diff = $t2 - $t1;
        if ($diff < 0) $diff += 24 * 60; // cross-midnight
        return (string)max(0, (int)round($diff));
    }

    private static function mapWipLastMonthRows(array $rows): array
    {
        return array_map(function ($row) {
            return [
                'month_year' => $row['MONTH_YEAR'] ?? $row['month_year'] ?? '',
                'product_type' => $row['PRODUCT_TYPE'] ?? $row['product_type'] ?? '',
                'wip_qty' => (string)($row['WIP_QTY'] ?? $row['wip_qty'] ?? '0'),
            ];
        }, $rows);
    }

    private static function getPlanRowsFromFile(string $productKey): array
    {
        $rows = self::readCsvRows('production_plan');
        $mapped = self::mapProductionPlanRows($rows);
        $label = self::productTypeLabel($productKey);
        return array_values(array_filter($mapped, function ($row) use ($label) {
            return ($row['PRODUCT_TYPE'] ?? '') === $label;
        }));
    }

    private static function getCompletedLotRowsFromFile(string $productKey): array
    {
        $rows = self::readCsvRows('production_completed_lot');
        $mapped = self::mapCompletedLotRows($rows);
        $label = self::productTypeLabel($productKey);
        return array_values(array_filter($mapped, function ($row) use ($label) {
            return ($row['PRODUCT_TYPE'] ?? '') === $label;
        }));
    }

    private static function getInputRowsFromFile(string $productKey): array
    {
        $rows = self::readCsvRows('production_input');
        $mapped = self::mapInputRows($rows);
        $label = self::productTypeLabel($productKey);
        return array_values(array_filter($mapped, function ($row) use ($label) {
            return ($row['PRODUCT_TYPE'] ?? '') === $label;
        }));
    }

    private static function getWipRowsFromFile(string $productKey): array
    {
        $rows = self::readCsvRows('wip');
        $mapped = self::mapWipRows($rows);
        $label = self::productTypeLabel($productKey);
        return array_values(array_filter($mapped, function ($row) use ($label) {
            return ($row['PRODUCT_TYPE'] ?? '') === $label;
        }));
    }

    private static function getMachineStatusRowsFromFile(string $productKey): array
    {
        $rows = self::readCsvRows('machine_status');
        $mapped = self::mapMachineStatusRows($rows);
        $label = self::productTypeLabel($productKey);
        return array_values(array_filter($mapped, function ($row) use ($label) {
            return ($row['PRODUCT_TYPE'] ?? '') === $label;
        }));
    }

    private static function getMcRecordRowsFromFile(string $productKey): array
    {
        $rows = self::readCsvRows('mcs_record');
        $mapped = self::mapMcRecordRows($rows);
        $label = self::productTypeLabel($productKey);
        return array_values(array_filter($mapped, function ($row) use ($label) {
            return ($row['PRODUCT_TYPE'] ?? '') === $label;
        }));
    }

    private static function getWipLastMonthRowsFromFile(): array
    {
        $rows = self::readCsvRows('wip_last_month');
        return self::mapWipLastMonthRows($rows);
    }

    // ── Date filtering ───────────────────────────────────────

    private static function filterByDateRange(array $rows, string $dateField, string $dateFilter, string $dayInput = '', string $monthFilter = '', string $yearFilter = ''): array
    {
        return array_values(array_filter($rows, function ($row) use ($dateField, $dateFilter, $dayInput, $monthFilter, $yearFilter) {
            $raw = $row[$dateField] ?? $row[strtoupper($dateField)] ?? '';
            if (!$raw) return true;
            // Normalize various date representations (e.g., "10 AUG 2026", "2026-08-10", "10/08/2026")
            $normalized = self::parseDateValue($raw);
            if (!$normalized) return true;
            $ts = strtotime($normalized);
            if (!$ts) return true;

            switch ($dateFilter) {
                case 'today':
                    return date('Y-m', $ts) === date('Y-m') && $ts <= strtotime('today');
                case 'yesterday':
                    $yesterday = strtotime('-1 day');
                    return date('Y-m', $ts) === date('Y-m', $yesterday) && $ts <= $yesterday;
                case 'day':
                    if ($dayInput) {
                        $targetTs = false;
                        // รองรับรูปแบบไทย DD/MM/YYYY
                        if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $dayInput)) {
                            $dt = DateTime::createFromFormat('d/m/Y', $dayInput);
                            if ($dt) $targetTs = $dt->getTimestamp();
                        } elseif (preg_match('/^\d{4}-\d{2}-\d{2}$/', $dayInput)) {
                            $dt = DateTime::createFromFormat('Y-m-d', $dayInput);
                            if ($dt) $targetTs = $dt->getTimestamp();
                        } else {
                            $targetTs = strtotime($dayInput);
                        }
                        return $targetTs && date('Y-m-d', $ts) === date('Y-m-d', $targetTs);
                    }
                    return true;
                case 'month':
                    if ($monthFilter) {
                        return date('Y-m', $ts) === $monthFilter;
                    }
                    return true;
                case 'year':
                    if ($yearFilter && preg_match('/^(\d{4})(F[12])$/i', $yearFilter, $m)) {
                        $year = (int)$m[1];
                        $month = (int)date('n', $ts);
                        $rowYear = (int)date('Y', $ts);
                        if (strtoupper($m[2]) === 'F1') {
                            return $rowYear === $year && $month >= 4 && $month <= 9;
                        }
                        return ($rowYear === $year && $month >= 10) || ($rowYear === $year + 1 && $month <= 3);
                    }
                    return true;
                default:
                    return true;
            }
        }));
    }

    private static function filterByProductType(array $rows, string $productKey, string $field = 'PRODUCT_TYPE'): array
    {
        if (!$productKey) return $rows;

        $normalized = self::normalizeProductTypeKey($productKey);
        $label = self::productTypeLabel($normalized);
        $aliases = [$label, $normalized, 'type' . strtoupper(substr($normalized, 4, 1))];

        return array_values(array_filter($rows, function ($row) use ($aliases, $field) {
            $val = $row[$field] ?? $row[strtolower($field)] ?? '';
            $candidate = self::normalizeProductTypeKey((string)$val);
            return in_array($candidate, array_map([self::class, 'normalizeProductTypeKey'], $aliases), true);
        }));
    }

    private static function getAllPlan(): array
    {
        $store = self::loadUserStore();
        $deleted = $store['plan_deleted'] ?? [];
        $all = array_merge(
            self::getPlanRowsFromFile('typeA'),
            self::getPlanRowsFromFile('typeB'),
            self::getPlanRowsFromFile('typeC'),
            self::getPlanRowsFromFile('typeD'),
            self::getPlanRowsFromFile('typeE'),
            $store['production_plan'] ?? []
        );
        return array_values(array_filter($all, function ($row) use ($deleted) {
            return !in_array(self::planKey($row), $deleted, true);
        }));
    }

    private static function getAllWipLastMonth(): array
    {
        $store = self::loadUserStore();
        $deleted = $store['wip_deleted'] ?? [];
        $all = array_merge(self::getWipLastMonthRowsFromFile(), $store['wip_last_month'] ?? []);
        $seen = [];
        $result = [];
        foreach (array_reverse($all) as $row) {
            $key = self::wipKey($row);
            if (in_array($key, $deleted, true) || isset($seen[$key])) continue;
            $seen[$key] = true;
            $result[] = $row;
        }
        return array_reverse($result);
    }

    // ── Public API handlers ──────────────────────────────────

    public static function login(string $username, string $password): array
    {
        $users = DEMO_USERS;
        if (!isset($users[$username]) || $users[$username]['password'] !== $password) {
            return ['success' => false, 'error' => 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (Demo: demo/demo)'];
        }
        $u = $users[$username];
        $userData = [
            'username' => $username,
            'name_eng' => $u['name_eng'],
            'employee_code' => strtoupper($username),
        ];
        return [
            'success' => true,
            'jwttoken' => base64_encode(json_encode(['username' => $username, 'loginTime' => time(), 'exp' => time() + 3600])),
            'username' => $username,
            'name_eng' => $u['name_eng'],
            'role' => $u['role'],
            'userData' => $userData,
        ];
    }

    public static function lineOptions(): array
    {
        // Read line names from production_plan CSV file
        $planRows = self::readCsvRows('production_plan');
        $lineNames = [];
        $productTypes = [];
        
        foreach ($planRows as $row) {
            $lineName = $row['LINE_NAME'] ?? $row['line_name'] ?? '';
            $productType = $row['PRODUCT_TYPE'] ?? $row['product_type'] ?? '';
            
            if ($lineName !== '' && !in_array($lineName, $lineNames)) {
                $lineNames[] = $lineName;
            }
            if ($productType !== '' && !in_array($productType, $productTypes)) {
                $productTypes[] = $productType;
            }
        }
        
        // Sort alphabetically for consistency
        sort($lineNames);
        sort($productTypes);
        
        $lineOptions = '';
        foreach ($lineNames as $line) {
            $lineOptions .= '<option value="' . htmlspecialchars($line) . '">' . htmlspecialchars($line) . '</option>';
        }
        
        $producttypeOptions = '';
        foreach ($productTypes as $t) {
            $producttypeOptions .= '<option value="' . htmlspecialchars($t) . '">' . htmlspecialchars($t) . '</option>';
        }
        
        return ['lineOptions' => $lineOptions, 'producttypeOptions' => $producttypeOptions];
    }

    public static function wipLastMonthOptions(): array
    {
        // Read product types from wip_last_month CSV file
        $wipRows = self::readCsvRows('wip_last_month');
        $productTypes = [];
        
        foreach ($wipRows as $row) {
            $productType = $row['PRODUCT_TYPE'] ?? $row['product_type'] ?? '';
            
            if ($productType !== '' && !in_array($productType, $productTypes)) {
                $productTypes[] = $productType;
            }
        }
        
        // Sort alphabetically for consistency
        sort($productTypes);
        
        $producttypeOptions = '';
        foreach ($productTypes as $t) {
            $producttypeOptions .= '<option value="' . htmlspecialchars($t) . '">' . htmlspecialchars($t) . '</option>';
        }
        
        return ['producttypeOptions' => $producttypeOptions];
    }

    public static function dataMonitors(array $params): array
    {
        $productType = $params['productType'] ?? '';
        $dateFilter = $params['dateFilter'] ?? 'yesterday';
        $dayInput = $params['dayInput'] ?? '';
        $monthFilter = $params['monthFilter'] ?? '';
        $yearFilter = $params['yearFilter'] ?? '';

        $normalizedProductType = $productType ?: 'typeA';

        $plan = self::filterByProductType(self::getAllPlan(), $normalizedProductType);
        $plan = self::filterByDateRange($plan, 'DATETIME', $dateFilter, $dayInput, $monthFilter, $yearFilter);

        $og = self::filterByProductType(self::getCompletedLotRowsFromFile($normalizedProductType), $normalizedProductType);
        $og = self::filterByDateRange($og, 'COMPLETION_PRASS_DATE', $dateFilter, $dayInput, $monthFilter, $yearFilter);

        $input = self::filterByProductType(self::getInputRowsFromFile($normalizedProductType), $normalizedProductType);
        $input = self::filterByDateRange($input, 'COMPLETION_PRASS_DATE', $dateFilter, $dayInput, $monthFilter, $yearFilter);

        $wipSum = 0;
        $wipRows = self::filterByProductType(self::getAllWipLastMonth(), $normalizedProductType, 'product_type');
        foreach ($wipRows as $r) {
            $wipSum += (int)($r['wip_qty'] ?? $r['WIP_QTY'] ?? 0);
        }

        return [
            'PlanData' => $plan,
            'OGData' => $og,
            'sqlPlan' => '[DEMO] mock query',
            'sqlOG' => '[DEMO] mock query',
            'WIPData' => $wipSum,
            'sqlWIP' => '[DEMO] mock query',
            'InputData' => $input,
            'sqlInput' => '[DEMO] mock query',
            'serverTime' => date('H:i:s'),
        ];
    }

    public static function dataWIP(string $productType): array
    {
        $normalizedProductType = $productType ?: 'typeA';
        $rows = self::filterByProductType(self::getWipRowsFromFile($normalizedProductType), $normalizedProductType);
        return [
            'SubWIP' => $rows,
            'MCS' => null,
            'sqlSubWIP' => '[DEMO] mock query',
        ];
    }

    public static function dataStatus(string $productType): array
    {
        $normalizedProductType = $productType ?: 'typeA';
        $rows = self::filterByProductType(self::getMachineStatusRowsFromFile($normalizedProductType), $normalizedProductType);
        return [
            'statusData' => $rows,
            'sqlStatus' => '[DEMO] mock query',
        ];
    }

    public static function dataMCRecord(array $params): array
    {
        $productType = $params['productType'] ?? '';
        $dateFilter = $params['dateFilter'] ?? '';
        $dayInput = $params['dayInput'] ?? '';
        $monthFilter = $params['monthFilter'] ?? '';
        $yearFilter = $params['yearFilter'] ?? '';

        $normalizedProductType = $productType ?: 'typeA';
        // Read raw and mapped rows to provide debug counts
        $rawRows = self::readCsvRows('mcs_record');
        $mappedRows = self::mapMcRecordRows($rawRows);

        $rowsAfterProduct = self::filterByProductType($mappedRows, $normalizedProductType);

        // If no dateFilter provided, do not force 'yesterday' — return full set for demo convenience
        $effectiveDateFilter = $dateFilter !== '' ? $dateFilter : '';
        $rowsAfterDate = self::filterByDateRange($rowsAfterProduct, 'DATETIME', $effectiveDateFilter, $dayInput, $monthFilter, $yearFilter);

        return [
            'mcRecordData' => $rowsAfterDate,
            'sqlmcRecord' => '[DEMO] mock query',
            'debug' => [
                'raw_count' => count($rawRows),
                'mapped_count' => count($mappedRows),
                'after_product_filter' => count($rowsAfterProduct),
                'after_date_filter' => count($rowsAfterDate),
                'effectiveDateFilter' => $effectiveDateFilter,
                'inputs' => [
                    'productType' => $productType,
                    'dateFilter' => $dateFilter,
                    'dayInput' => $dayInput,
                    'monthFilter' => $monthFilter,
                    'yearFilter' => $yearFilter,
                ]
            ]
        ];
    }

    public static function loadPlan(array $params): array
    {
        $rows = self::getAllPlan();
        $month = $params['month'] ?? '';
        $year = $params['year'] ?? '';
        $line = $params['line'] ?? '';
        $createType = $params['create_type'] ?? '';
        $productType = $params['product_type'] ?? '';

        $filtered = array_filter($rows, function ($row) use ($month, $year, $line, $createType, $productType) {
            $dt = $row['DATETIME'] ?? '';
            if ($month && date('m', strtotime($dt)) !== str_pad($month, 2, '0', STR_PAD_LEFT)) return false;
            if ($year && date('Y', strtotime($dt)) !== $year) return false;
            if ($line && ($row['LINE_NAME'] ?? '') !== $line) return false;
            if ($createType !== '' && (string)($row['CREATE_TYPE'] ?? '') !== (string)$createType) return false;
            if ($productType && ($row['PRODUCT_TYPE'] ?? '') !== $productType) return false;
            return true;
        });

        $data = [];
        foreach ($filtered as $row) {
            $data[] = [
                'create_type' => $row['CREATE_TYPE'] ?? '0',
                'datetime' => isset($row['DATETIME']) ? date('d/m/Y', strtotime($row['DATETIME'])) : '',
                'qty' => $row['QTY'] ?? '',
                'type' => $row['TYPE'] ?? '',
                'line_name' => $row['LINE_NAME'] ?? '',
                'product_type' => $row['PRODUCT_TYPE'] ?? '',
                'empno' => $row['EMPNO'] ?? '',
            ];
        }
        return ['success' => true, 'data' => array_values($data)];
    }

    public static function insertPlan(array $input): array
    {
        $store = self::loadUserStore();
        $rows = $input['data'] ?? [];
        $createType = isset($input['create_type']) ? (string)(int)$input['create_type'] : '0';
        $inserted = 0;
        foreach ($rows as $row) {
            $parsed = self::parseDate($row['datetime'] ?? '');
            if (!$parsed) continue;
            $store['production_plan'][] = [
                'CREATE_TYPE' => $createType,
                'DATETIME' => $parsed,
                'QTY' => (string)($row['qty'] ?? '0'),
                'TYPE' => $row['type'] ?? 'Input',
                'LINE_NAME' => $row['line_name'] ?? '',
                'PRODUCT_TYPE' => $row['product_type'] ?? 'Type A',
                'EMPNO' => $row['empno'] ?? 'E001',
            ];
            $inserted++;
        }
        self::$userStore = $store;
        self::saveUserStore();
        return ['success' => true, 'message' => 'All data inserted successfully (demo).', 'inserted_count' => $inserted];
    }

    public static function updatePlan(array $rows): array
    {
        $store = self::loadUserStore();
        $updated = 0;
        foreach ($rows as $row) {
            $key = self::planKey($row);
            $found = false;
            foreach ($store['production_plan'] as &$stored) {
                if (self::planKey($stored) === $key) {
                    $stored['QTY'] = (string)($row['qty'] ?? $stored['QTY']);
                    $stored['EMPNO'] = $row['empno'] ?? $stored['EMPNO'];
                    $found = true;
                    $updated++;
                    break;
                }
            }
            unset($stored);
            if (!$found) {
                $parsed = self::parseDate($row['datetime'] ?? '');
                if ($parsed) {
                    $store['production_plan'][] = [
                        'CREATE_TYPE' => (string)($row['create_type'] ?? '0'),
                        'DATETIME' => $parsed,
                        'QTY' => (string)($row['qty'] ?? '0'),
                        'TYPE' => $row['type'] ?? 'Input',
                        'LINE_NAME' => $row['line_name'] ?? '',
                        'PRODUCT_TYPE' => $row['product_type'] ?? 'Type A',
                        'EMPNO' => $row['empno'] ?? 'E001',
                    ];
                    $updated++;
                }
            }
        }
        self::$userStore = $store;
        self::saveUserStore();
        return ['success' => $updated > 0, 'updated' => $updated, 'failed' => 0, 'errorRows' => [], 'debugInfo' => []];
    }

    public static function deletePlan(array $rows): array
    {
        $store = self::loadUserStore();
        $deleted = 0;
        foreach ($rows as $row) {
            $key = self::planKey($row);
            if (!in_array($key, $store['plan_deleted'], true)) {
                $store['plan_deleted'][] = $key;
            }
            $store['production_plan'] = array_values(array_filter(
                $store['production_plan'],
                fn($r) => self::planKey($r) !== $key
            ));
            $deleted++;
        }
        self::$userStore = $store;
        self::saveUserStore();
        return ['success' => $deleted > 0, 'deleted' => $deleted, 'failed' => 0, 'errorRows' => [], 'debugInfo' => []];
    }

    public static function empcodeCheck(string $empcode): string
    {
        $map = DEMO_EMPLOYEES;
        $key = strtoupper($empcode);
        return $map[$key] ?? 'employee not found';
    }

    public static function loadWipLastMonth(array $params): array
    {
        $rows = self::getAllWipLastMonth();
        $month = $params['month'] ?? '';
        $year = $params['year'] ?? '';
        $productType = $params['product_type'] ?? '';

        $filtered = array_filter($rows, function ($row) use ($month, $year, $productType) {
            $my = $row['month_year'] ?? '';
            if ($month && substr($my, 0, 2) !== str_pad($month, 2, '0', STR_PAD_LEFT)) return false;
            if ($year && substr($my, -4) !== $year) return false;
            if ($productType && ($row['product_type'] ?? '') !== $productType) return false;
            return true;
        });

        return ['success' => true, 'data' => array_values($filtered)];
    }

    public static function insertWip(array $input): array
    {
        $store = self::loadUserStore();
        $rows = $input['data'] ?? [];
        $inserted = 0;
        foreach ($rows as $row) {
            $row = array_change_key_case($row, CASE_LOWER);
            $parsed = self::parseDate($row['month_year'] ?? '');
            if (!$parsed) continue;
            $store['wip_last_month'][] = [
                'month_year' => date('m/Y', strtotime($parsed)),
                'product_type' => $row['product_type'] ?? 'Type A',
                'wip_qty' => (string)($row['wip_qty'] ?? '0'),
            ];
            $inserted++;
        }
        self::$userStore = $store;
        self::saveUserStore();
        return ['success' => true, 'message' => 'All data inserted successfully (demo).', 'inserted_count' => $inserted];
    }

    public static function updateWip(array $rows): array
    {
        $store = self::loadUserStore();
        $updated = 0;
        foreach ($rows as $row) {
            $row = array_change_key_case($row, CASE_LOWER);
            $key = self::wipKey($row);
            $found = false;
            foreach ($store['wip_last_month'] as &$stored) {
                if (self::wipKey($stored) === $key) {
                    $stored['wip_qty'] = (string)($row['wip_qty'] ?? $stored['wip_qty']);
                    $found = true;
                    $updated++;
                    break;
                }
            }
            unset($stored);
            if (!$found) {
                $parsed = self::parseDate($row['month_year'] ?? '');
                if ($parsed) {
                    $store['wip_last_month'][] = [
                        'month_year' => date('m/Y', strtotime($parsed)),
                        'product_type' => $row['product_type'] ?? 'Type A',
                        'wip_qty' => (string)($row['wip_qty'] ?? '0'),
                    ];
                    $updated++;
                }
            }
        }
        self::$userStore = $store;
        self::saveUserStore();
        return ['success' => $updated > 0, 'updated' => $updated, 'failed' => 0, 'errorRows' => [], 'debugInfo' => []];
    }

    public static function deleteWip(array $rows): array
    {
        $store = self::loadUserStore();
        $deleted = 0;
        foreach ($rows as $row) {
            $row = array_change_key_case($row, CASE_LOWER);
            $key = self::wipKey($row);
            if (!in_array($key, $store['wip_deleted'], true)) {
                $store['wip_deleted'][] = $key;
            }
            $store['wip_last_month'] = array_values(array_filter(
                $store['wip_last_month'],
                fn($r) => self::wipKey($r) !== $key
            ));
            $deleted++;
        }
        self::$userStore = $store;
        self::saveUserStore();
        return ['success' => $deleted > 0, 'deleted' => $deleted, 'failed' => 0, 'errorRows' => [], 'debugInfo' => []];
    }

    private static function parseDate(?string $dateString): ?string
    {
        if (!$dateString) return null;
        $parts = explode('/', $dateString);
        if (count($parts) === 3) {
            $day = (int)$parts[0];
            $month = (int)$parts[1];
            $year = (int)$parts[2];
            if ($year < 100) $year += 2000;
            if (checkdate($month, $day, $year)) {
                return sprintf('%04d-%02d-%02d', $year, $month, $day);
            }
        }
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateString)) {
            return $dateString;
        }
        if (preg_match('/^\d{2}\/\d{4}$/', $dateString)) {
            [$m, $y] = explode('/', $dateString);
            return sprintf('%04d-%02d-01', (int)$y, (int)$m);
        }
        return null;
    }
}
