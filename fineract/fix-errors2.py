import re
import os

BASE = "D:/neobank/fineract/fineract-provider/src/main/java/org/apache/fineract"

def read_file(path):
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# SmsMessageScheduledJobService.java - remove SmsCampaign parameter
p = f"{BASE}/infrastructure/sms/scheduler/SmsMessageScheduledJobService.java"
c = read_file(p)
c = c.replace('SmsCampaign', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# SmsMessageScheduledJobServiceImpl.java - remove SmsCampaign/notification references
p = f"{BASE}/infrastructure/sms/scheduler/SmsMessageScheduledJobServiceImpl.java"
c = read_file(p)
c = c.replace('SmsCampaign', 'Object')
c = c.replace('NotificationConfigurationData', 'Object')
c = c.replace('MessageGatewayConfigurationData', 'Object')
c = c.replace('SmsConfigUtils', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# ExternalServicesPropertiesReadPlatformService.java
p = f"{BASE}/infrastructure/configuration/service/ExternalServicesPropertiesReadPlatformService.java"
c = read_file(p)
c = c.replace('NotificationConfigurationData', 'Object')
c = c.replace('MessageGatewayConfigurationData', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# ExternalServicesPropertiesReadPlatformServiceImpl.java
p = f"{BASE}/infrastructure/configuration/service/ExternalServicesPropertiesReadPlatformServiceImpl.java"
c = read_file(p)
c = c.replace('NotificationConfigurationData', 'Object')
c = c.replace('MessageGatewayConfigurationData', 'Object')
c = c.replace('NotificationSenderService', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# SecurityConfig.java - remove interop reference
p = f"{BASE}/infrastructure/core/config/SecurityConfig.java"
c = read_file(p)
# Remove the InteropApiResource import
c = re.sub(r'import.*InteropApiResource.*;\n', '', c)
# Replace the interop request matcher line
c = re.sub(r'.*InteropApiResource.*\n', '', c)
write_file(p, c)
print(f"Fixed {p}")

# AuthorizationServerConfig.java
p = f"{BASE}/infrastructure/security/config/AuthorizationServerConfig.java"
c = read_file(p)
c = re.sub(r'import.*InteropApiResource.*;\n', '', c)
c = re.sub(r'.*InteropApiResource.*\n', '', c)
write_file(p, c)
print(f"Fixed {p}")

# InlineJobType.java - remove working capital enum value
p = f"{BASE}/infrastructure/jobs/service/InlineJobType.java"
c = read_file(p)
# Remove the working capital enum entries (carefully - they might have comma)
c = re.sub(r'\s*WORKING_CAPITAL_LOAN_COB\([^)]*\),?\s*\n', '\n', c)
write_file(p, c)
print(f"Fixed {p}")

# JournalEntryWritePlatformService.java
p = f"{BASE}/accounting/journalentry/service/JournalEntryWritePlatformService.java"
c = read_file(p)
# Comment out share methods
c = c.replace('    void createJournalEntriesForShares(Map<String, Object> accountingBridgeData);', '    // NeoBank: share accounting removed')
c = c.replace('    void revertShareAccountJournalEntries(ArrayList<Long> transactionId, LocalDate transactionDate);', '    // NeoBank: share accounting removed')
# Comment out external asset owner method
c = re.sub(r'    /\*\*\s*\n\s*\* Create journal entries immediately for an external owner transfer.*?ExternalAssetOwner previousOwner\);', '    // NeoBank: external asset owner transfer removed', c, flags=re.DOTALL)
write_file(p, c)
print(f"Fixed {p}")

# JournalEntryWritePlatformServiceJpaRepositoryImpl.java
p = f"{BASE}/accounting/journalentry/service/JournalEntryWritePlatformServiceJpaRepositoryImpl.java"
c = read_file(p)
# Replace ExternalAssetOwner types with Object
c = c.replace('ExternalAssetOwnerTransfer', 'Object')
c = c.replace('ExternalAssetOwnerRepository', 'Object')
c = c.replace('ExternalAssetOwner ', 'Object ')
# Replace AccountingService reference
c = c.replace('AccountingService', 'Object')
# Replace SharesDTO/SharesTransactionDTO
c = c.replace('SharesTransactionDTO', 'Object')
c = c.replace('SharesDTO', 'Object')
c = c.replace('CashBasedAccountingProcessorForShares', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# AccountingJournalEntryConfiguration.java
p = f"{BASE}/accounting/journalentry/starter/AccountingJournalEntryConfiguration.java"
c = read_file(p)
c = c.replace('AccountingService', 'Object')
c = c.replace('CashBasedAccountingProcessorForShares', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# AccountingProcessorHelper.java
p = f"{BASE}/accounting/journalentry/service/AccountingProcessorHelper.java"
c = read_file(p)
c = c.replace('SharesDTO', 'Object')
c = c.replace('SharesTransactionDTO', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# Note.java - ShareAccount field
p = f"{BASE}/portfolio/note/domain/Note.java"
c = read_file(p)
# Change ShareAccount ManyToOne to Long column
c = re.sub(r'@ManyToOne\s*\n\s*@JoinColumn\(name = "share_account_id"\)\s*\n\s*private ShareAccount shareAccount;',
           '@Column(name = "share_account_id")\n    private Long shareAccountId;', c)
# Fix constructor/method references
c = c.replace('final ShareAccount shareAccount', 'final Long shareAccountId')
c = c.replace('this.shareAccount = shareAccount', 'this.shareAccountId = shareAccountId')
write_file(p, c)
print(f"Fixed {p}")

# AccountNumberGenerator.java
p = f"{BASE}/portfolio/account/service/AccountNumberGenerator.java"
c = read_file(p)
c = c.replace('ShareAccount', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# AccountSummaryCollectionData.java
p = f"{BASE}/portfolio/accountdetails/data/AccountSummaryCollectionData.java"
c = read_file(p)
c = c.replace('ShareAccountSummaryData', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# AccountDetailsReadPlatformServiceJpaRepositoryImpl.java
p = f"{BASE}/portfolio/accountdetails/service/AccountDetailsReadPlatformServiceJpaRepositoryImpl.java"
c = read_file(p)
c = c.replace('ShareAccountSummaryData', 'Object')
c = c.replace('ShareAccountStatusEnumData', 'Object')
c = c.replace('SharesEnumerations', 'Object')
c = c.replace('ShareAccountApplicationTimelineData', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# CalendarReadPlatformService.java
p = f"{BASE}/portfolio/calendar/service/CalendarReadPlatformService.java"
c = read_file(p)
c = c.replace('MeetingData', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# CalendarReadPlatformServiceImpl.java
p = f"{BASE}/portfolio/calendar/service/CalendarReadPlatformServiceImpl.java"
c = read_file(p)
c = c.replace('MeetingData', 'Object')
c = c.replace('MeetingReadService', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# ConvertChargeDataToSpecificChargeData.java
p = f"{BASE}/portfolio/charge/util/ConvertChargeDataToSpecificChargeData.java"
c = read_file(p)
c = c.replace('ShareAccountChargeData', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# CentersApiResource.java
p = f"{BASE}/portfolio/group/api/CentersApiResource.java"
c = read_file(p)
c = c.replace('CollectionSheetReadPlatformService', 'Object')
c = c.replace('CollectionSheetWritePlatformService', 'Object')
c = c.replace('MeetingReadService', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# GroupsApiResource.java
p = f"{BASE}/portfolio/group/api/GroupsApiResource.java"
c = read_file(p)
c = c.replace('CollectionSheetReadPlatformService', 'Object')
c = c.replace('CollectionSheetWritePlatformService', 'Object')
c = c.replace('MeetingReadService', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# NotificationDomainServiceImpl.java
p = f"{BASE}/notification/service/NotificationDomainServiceImpl.java"
c = read_file(p)
c = re.sub(r'import.*share\.ShareAccount.*;\n', '', c)
c = re.sub(r'import.*share\.ShareProduct.*;\n', '', c)
c = c.replace('ShareAccountApproveBusinessEvent', 'Object')
c = c.replace('ShareAccountCreateBusinessEvent', 'Object')
c = c.replace('ShareProductDividentsCreateBusinessEvent', 'Object')
c = c.replace('NotificationSenderService', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# BulkImportWorkbookPopulatorServiceImpl.java
p = f"{BASE}/infrastructure/bulkimport/service/BulkImportWorkbookPopulatorServiceImpl.java"
c = read_file(p)
c = c.replace('SharedProductsSheetPopulator', 'Object')
c = c.replace('SharedAccountWorkBookPopulator', 'Object')
c = re.sub(r'import.*shareaccount.*;\n', '', c)
write_file(p, c)
print(f"Fixed {p}")

# LoansApiResource.java
p = f"{BASE}/portfolio/loanaccount/api/LoansApiResource.java"
c = read_file(p)
c = c.replace('PostDatedChecksRepository', 'Object')
c = c.replace('LoanOriginatorReadPlatformService', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# LoanAccountDomainServiceJpa.java
p = f"{BASE}/portfolio/loanaccount/domain/LoanAccountDomainServiceJpa.java"
c = read_file(p)
c = c.replace('PostDatedChecksRepository', 'Object')
c = c.replace('PostDatedChecks', 'Object')
c = c.replace('RepaymentWithPostDatedChecksAssembler', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# LoanWritePlatformServiceJpaRepositoryImpl.java
p = f"{BASE}/portfolio/loanaccount/service/LoanWritePlatformServiceJpaRepositoryImpl.java"
c = read_file(p)
c = c.replace('PostDatedChecksRepository', 'Object')
c = c.replace('PostDatedChecks', 'Object')
c = c.replace('RepaymentWithPostDatedChecksAssembler', 'Object')
c = c.replace('ExternalAssetOwnerTransfer', 'Object')
c = c.replace('ExternalAssetOwnerRepository', 'Object')
c = c.replace('ExternalAssetOwner ', 'Object ')
c = c.replace('WorkingCapitalLoanRepository', 'Object')
c = c.replace('WorkingCapitalLoan ', 'Object ')
c = c.replace('WorkingCapitalLoanApplicationReadPlatformService', 'Object')
c = c.replace('LoanOriginatorReadPlatformService', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# LoanAccountAutoStarter.java
p = f"{BASE}/portfolio/loanaccount/starter/LoanAccountAutoStarter.java"
c = read_file(p)
c = c.replace('ProgressiveLoanModelCheckerFilter', 'Object')
c = c.replace('ProgressiveLoanInterestRefundServiceImpl', 'Object')
write_file(p, c)
print(f"Fixed {p}")

# LoanAccountConfiguration.java
p = f"{BASE}/portfolio/loanaccount/starter/LoanAccountConfiguration.java"
c = read_file(p)
c = c.replace('PostDatedChecksRepository', 'Object')
c = c.replace('ExternalAssetOwnerRepository', 'Object')
c = c.replace('WorkingCapitalLoanRepository', 'Object')
write_file(p, c)
print(f"Fixed {p}")

print("\n=== All fixes applied ===")
