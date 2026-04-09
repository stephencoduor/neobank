import re
import os

BASE = "D:/neobank/fineract/fineract-provider/src/main/java/org/apache/fineract"

def read_file(path):
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# AccountingProcessorHelper.java - still references SharesDTO, SharesTransactionDTO
p = f"{BASE}/accounting/journalentry/service/AccountingProcessorHelper.java"
c = read_file(p)
# Remove import for AccountingProcessorForSharesFactory
c = re.sub(r'import.*AccountingProcessorForSharesFactory.*;\n', '', c)
c = re.sub(r'import.*AccountingProcessorForShares[^F].*;\n', '', c)
c = re.sub(r'import.*SharesDTO.*;\n', '', c)
c = re.sub(r'import.*SharesTransactionDTO.*;\n', '', c)
write_file(p, c)
print(f"Fixed imports in {p}")

# JournalEntryWritePlatformServiceJpaRepositoryImpl.java
p = f"{BASE}/accounting/journalentry/service/JournalEntryWritePlatformServiceJpaRepositoryImpl.java"
c = read_file(p)
c = re.sub(r'import.*AccountingProcessorForSharesFactory.*;\n', '', c)
c = re.sub(r'import.*AccountingProcessorForShares[^F].*;\n', '', c)
c = re.sub(r'import.*ExternalAssetOwner.*;\n', '', c)
c = re.sub(r'import.*AccountingService.*;\n', '', c)
write_file(p, c)
print(f"Fixed imports in {p}")

# AccountingJournalEntryConfiguration.java
p = f"{BASE}/accounting/journalentry/starter/AccountingJournalEntryConfiguration.java"
c = read_file(p)
c = re.sub(r'import.*AccountingProcessorForSharesFactory.*;\n', '', c)
c = re.sub(r'import.*AccountingProcessorForShares[^F].*;\n', '', c)
c = re.sub(r'import.*AccountingService.*;\n', '', c)
c = re.sub(r'import.*CashBasedAccountingProcessorForShares.*;\n', '', c)
write_file(p, c)
print(f"Fixed imports in {p}")

# BulkImportWorkbookPopulatorServiceImpl.java
p = f"{BASE}/infrastructure/bulkimport/service/BulkImportWorkbookPopulatorServiceImpl.java"
c = read_file(p)
c = re.sub(r'import.*SharedProductsSheetPopulator.*;\n', '', c)
c = re.sub(r'import.*SharedAccountWorkBookPopulator.*;\n', '', c)
c = re.sub(r'import.*shareaccount.*;\n', '', c)
c = re.sub(r'import.*ShareProductData.*;\n', '', c)
write_file(p, c)
print(f"Fixed imports in {p}")

# SmsMessageScheduledJobServiceImpl.java
p = f"{BASE}/infrastructure/sms/scheduler/SmsMessageScheduledJobServiceImpl.java"
c = read_file(p)
c = re.sub(r'import.*NotificationSenderService.*;\n', '', c)
c = re.sub(r'import.*SmsConfigUtils.*;\n', '', c)
write_file(p, c)
print(f"Fixed imports in {p}")

# InlineJobType.java
p = f"{BASE}/infrastructure/jobs/service/InlineJobType.java"
c = read_file(p)
c = re.sub(r'import.*WorkingCapitalLoan.*;\n', '', c)
c = re.sub(r'import.*InlineWorkingCapitalLoanCOBExecutorServiceImpl.*;\n', '', c)
write_file(p, c)
print(f"Fixed imports in {p}")

# AccountNumberGenerator.java
p = f"{BASE}/portfolio/account/service/AccountNumberGenerator.java"
c = read_file(p)
c = re.sub(r'import.*ShareAccount[^S].*;\n', '', c)
write_file(p, c)
print(f"Fixed imports in {p}")

# AccountDetailsReadPlatformServiceJpaRepositoryImpl.java
p = f"{BASE}/portfolio/accountdetails/service/AccountDetailsReadPlatformServiceJpaRepositoryImpl.java"
c = read_file(p)
c = re.sub(r'import.*ShareAccountSummaryData.*;\n', '', c)
c = re.sub(r'import.*ShareAccountStatusEnumData.*;\n', '', c)
c = re.sub(r'import.*SharesEnumerations.*;\n', '', c)
c = re.sub(r'import.*ShareAccountApplicationTimelineData.*;\n', '', c)
write_file(p, c)
print(f"Fixed imports in {p}")

# LoanWritePlatformServiceJpaRepositoryImpl.java
p = f"{BASE}/portfolio/loanaccount/service/LoanWritePlatformServiceJpaRepositoryImpl.java"
c = read_file(p)
c = re.sub(r'import.*PostDatedChecks.*;\n', '', c)
c = re.sub(r'import.*RepaymentWithPostDatedChecksAssembler.*;\n', '', c)
c = re.sub(r'import.*ExternalAssetOwner.*;\n', '', c)
c = re.sub(r'import.*WorkingCapitalLoan.*;\n', '', c)
c = re.sub(r'import.*LoanOriginatorReadPlatformService.*;\n', '', c)
write_file(p, c)
print(f"Fixed imports in {p}")

# LoanAccountAutoStarter.java
p = f"{BASE}/portfolio/loanaccount/starter/LoanAccountAutoStarter.java"
c = read_file(p)
c = re.sub(r'import.*ProgressiveLoanModelCheckerFilter.*;\n', '', c)
c = re.sub(r'import.*ProgressiveLoanInterestRefundServiceImpl.*;\n', '', c)
write_file(p, c)
print(f"Fixed imports in {p}")

# LoanAccountConfiguration.java
p = f"{BASE}/portfolio/loanaccount/starter/LoanAccountConfiguration.java"
c = read_file(p)
c = re.sub(r'import.*PostDatedChecksRepository.*;\n', '', c)
c = re.sub(r'import.*ExternalAssetOwnerRepository.*;\n', '', c)
c = re.sub(r'import.*WorkingCapitalLoanRepository.*;\n', '', c)
write_file(p, c)
print(f"Fixed imports in {p}")

# NotificationDomainServiceImpl.java
p = f"{BASE}/notification/service/NotificationDomainServiceImpl.java"
c = read_file(p)
c = re.sub(r'import.*ShareAccount.*;\n', '', c)
c = re.sub(r'import.*ShareProduct.*;\n', '', c)
c = re.sub(r'import.*NotificationSenderService.*;\n', '', c)
write_file(p, c)
print(f"Fixed imports in {p}")

print("\n=== Done ===")
