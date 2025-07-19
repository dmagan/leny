<?php
/**
 * کلاس پردازش فایل‌های اکسل
 */

if (!defined('ABSPATH')) {
    exit;
}

class BCM_Excel_Handler {
    
    /**
     * پردازش فایل آپلود شده
     */
    public function process_file($file_path, $file_extension) {
        switch (strtolower($file_extension)) {
            case 'csv':
                return $this->process_csv($file_path);
            case 'xlsx':
            case 'xls':
                return $this->process_excel($file_path);
            default:
                return array(
                    'success' => false,
                    'message' => 'فرمت فایل پشتیبانی نمی‌شود.'
                );
        }
    }
    
    /**
     * پردازش فایل CSV
     */
    private function process_csv($file_path) {
        $codes = array();
        
        if (($handle = fopen($file_path, "r")) !== FALSE) {
            $row_count = 0;
            
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                $row_count++;
                
                // رد کردن ردیف اول اگر header باشد
                if ($row_count == 1 && !is_numeric($data[0])) {
                    continue;
                }
                
                if (!empty($data[0])) {
                    $codes[] = trim($data[0]);
                }
            }
            
            fclose($handle);
        } else {
            return array(
                'success' => false,
                'message' => 'خطا در خواندن فایل CSV.'
            );
        }
        
        return $this->add_codes_to_database($codes);
    }
    
    /**
     * پردازش فایل اکسل
     */
    private function process_excel($file_path) {