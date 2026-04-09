import re
import os

BASE = "D:/neobank/fineract/fineract-provider/src/main/java/org/apache/fineract"

def read_file(path):
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def remove_lines_containing(content, patterns):
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        if not any(p in line for p in patterns):
            new_lines.append(line)
    return '\n'.join(new_lines)

def remove_import(content, cls):
    return re.sub(r'import [a-z.].*\.' + cls + r';\n', '', content)

SHARE_PATTERNS = ['ShareAccount', 'ShareProduct', 'SharedProduct', 'SharesDTO', 'SharesTransaction', 'shareAccount', 'shareProduct', 'SharedAccount']
INVESTOR_PATTERNS = ['ExternalAssetOwner', 'ExternalAssetOwnerTransfer', 'ExternalAssetOwnerRepository', 'externalAssetOwner', 'externalOwner']
CAMPAIGN_PATTERNS = ['SmsCampaign', 'smsCampaign', 'SmsConfigUtils', 'smsConfigUtils', 'SmsCampaignRepository']
MEETING_PATTERNS = ['MeetingReadService', 'MeetingData', 'meetingData']
COLLECTION_PATTERNS = ['CollectionSheetWritePlatformService', 'CollectionSheetReadPlatformService', 'CollectionSheetBulk', 'collectionSheet']
TELLER_PATTERNS = ['CashierTransactionDataValidator', 'cashierTransactionDataValidator']
NOTIFICATION_CONFIG_PATTERNS = ['NotificationConfigurationData', 'MessageGatewayConfigurationData', 'NotificationSenderService']
POSTDATED_PATTERNS = ['PostDatedChecksRepository', 'PostDatedChecks', 'RepaymentWithPostDatedChecksAssembler', 'postDatedChecks']
WC_PATTERNS = ['WorkingCapitalLoan', 'workingCapitalLoan', 'WorkingCapital']
ORIGINATION_PATTERNS = ['LoanOriginatorReadPlatformService', 'loanOriginatorReadPlatformService']

# JournalEntryWritePlatformService.java
p = f"{BASE}/accounting/journalentry/service/JournalEntryWritePlatformService.java"
content = read_file(p)
content = re.sub(r'\n\s*void createJournalEntriesForShares\(.*?\);\n', '\n', content)
content = re.sub(r'\n\s*void revertShareAccountJournalEntries\(.*?\);\n', '\n', content)
content = re.sub(r'/\*\*\s*\n\s*\* Create journal entries immediately for an external owner transfer.*?void createJournalEntriesForExternalOwnerTransfer\(.*?\);\n', '', content, flags=re.DOTALL)
write_file(p, content)
print(f"Fixed {p}")

# JournalEntryWritePlatformServiceJpaRepositoryImpl.java
p = f"{BASE}/accounting/journalentry/service/JournalEntryWritePlatformServiceJpaRepositoryImpl.java"
content = read_file(p)
for cls in ['SharesTransactionDTO', 'AccountingService', 'ExternalAssetOwner', 'ExternalAssetOwnerTransfer', 'ExternalAssetOwnerRepository', 'SharesDTO', 'CashBasedAccountingProcessorForShares']:
    content = remove_import(content, cls)
content = remove_lines_containing(content, ['AccountingService', 'ExternalAssetOwnerRepository', 'CashBasedAccountingProcessorForShares', 'SharesDTO', 'SharesTransactionDTO'])
content = re.sub(r'\n\s*@Override\s*\n\s*public void createJournalEntriesForShares\([^}]*?\n\s*\}\n', '\n', content, flags=re.DOTALL)
content = re.sub(r'\n\s*@Override\s*\n\s*public void revertShareAccountJournalEntries\([^}]*?\n\s*\}\n', '\n', content, flags=re.DOTALL)
content = re.sub(r'\n\s*@Override\s*\n\s*public void createJournalEntriesForExternalOwnerTransfer\([^}]*?\n\s*\}\n', '\n', content, flags=re.DOTALL)
write_file(p, content)
print(f"Fixed {p}")

# AccountingJournalEntryConfiguration.java
p = f"{BASE}/accounting/journalentry/starter/AccountingJournalEntryConfiguration.java"
content = read_file(p)
content = remove_lines_containing(content, ['AccountingService', 'CashBasedAccountingProcessorForShares'])
write_file(p, content)
print(f"Fixed {p}")

# AccountingProcessorHelper.java
p = f"{BASE}/accounting/journalentry/service/AccountingProcessorHelper.java"
content = read_file(p)
content = remove_import(content, 'SharesDTO')
content = remove_import(content, 'SharesTransactionDTO')
content = re.sub(r'\n\s*public SharesDTO populateSharesDtoFromMap\([^}]*?\n\s*\}\n', '\n', content, flags=re.DOTALL)
write_file(p, content)
print(f"Fixed {p}")

# Note.java
p = f"{BASE}/portfolio/note/domain/Note.java"
content = read_file(p)
content = remove_lines_containing(content, ['ShareAccount'])
write_file(p, content)
print(f"Fixed {p}")

# AccountNumberGenerator.java
p = f"{BASE}/portfolio/account/service/AccountNumberGenerator.java"
content = read_file(p)
content = remove_lines_containing(content, SHARE_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# AccountDetailsReadPlatformServiceJpaRepositoryImpl.java
p = f"{BASE}/portfolio/accountdetails/service/AccountDetailsReadPlatformServiceJpaRepositoryImpl.java"
content = read_file(p)
content = remove_lines_containing(content, SHARE_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# CalendarReadPlatformService.java
p = f"{BASE}/portfolio/calendar/service/CalendarReadPlatformService.java"
content = read_file(p)
content = remove_lines_containing(content, MEETING_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# CalendarReadPlatformServiceImpl.java
p = f"{BASE}/portfolio/calendar/service/CalendarReadPlatformServiceImpl.java"
content = read_file(p)
content = remove_lines_containing(content, MEETING_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# ConvertChargeDataToSpecificChargeData.java
p = f"{BASE}/portfolio/charge/util/ConvertChargeDataToSpecificChargeData.java"
content = read_file(p)
content = remove_lines_containing(content, SHARE_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# CentersApiResource.java
p = f"{BASE}/portfolio/group/api/CentersApiResource.java"
content = read_file(p)
content = remove_lines_containing(content, COLLECTION_PATTERNS + MEETING_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# GroupsApiResource.java
p = f"{BASE}/portfolio/group/api/GroupsApiResource.java"
content = read_file(p)
content = remove_lines_containing(content, COLLECTION_PATTERNS + MEETING_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# Delete collection sheet handlers
for name in ['SaveCenterCollectionSheetCommandHandler.java', 'SaveGroupCollectionSheetCommandHandler.java']:
    p = f"{BASE}/portfolio/group/handler/{name}"
    if os.path.exists(p):
        os.remove(p)
        print(f"Deleted {p}")

# SmsMessage.java
p = f"{BASE}/infrastructure/sms/domain/SmsMessage.java"
content = read_file(p)
content = remove_lines_containing(content, CAMPAIGN_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# SmsMessageAssembler.java
p = f"{BASE}/infrastructure/sms/domain/SmsMessageAssembler.java"
content = read_file(p)
content = remove_lines_containing(content, CAMPAIGN_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# SmsMessageScheduledJobService.java
p = f"{BASE}/infrastructure/sms/scheduler/SmsMessageScheduledJobService.java"
content = read_file(p)
content = remove_lines_containing(content, CAMPAIGN_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# SmsMessageScheduledJobServiceImpl.java
p = f"{BASE}/infrastructure/sms/scheduler/SmsMessageScheduledJobServiceImpl.java"
content = read_file(p)
content = remove_lines_containing(content, CAMPAIGN_PATTERNS + NOTIFICATION_CONFIG_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# ExternalServicesPropertiesReadPlatformService.java
p = f"{BASE}/infrastructure/configuration/service/ExternalServicesPropertiesReadPlatformService.java"
content = read_file(p)
content = remove_lines_containing(content, NOTIFICATION_CONFIG_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# ExternalServicesPropertiesReadPlatformServiceImpl.java
p = f"{BASE}/infrastructure/configuration/service/ExternalServicesPropertiesReadPlatformServiceImpl.java"
content = read_file(p)
content = remove_lines_containing(content, NOTIFICATION_CONFIG_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# NotificationDomainServiceImpl.java
p = f"{BASE}/notification/service/NotificationDomainServiceImpl.java"
content = read_file(p)
content = remove_lines_containing(content, SHARE_PATTERNS + ['ShareAccountApproveBusinessEvent', 'ShareAccountCreateBusinessEvent', 'ShareProductDividentsCreateBusinessEvent'])
write_file(p, content)
print(f"Fixed {p}")

# BulkImportWorkbookPopulatorServiceImpl.java
p = f"{BASE}/infrastructure/bulkimport/service/BulkImportWorkbookPopulatorServiceImpl.java"
content = read_file(p)
content = remove_lines_containing(content, SHARE_PATTERNS + ['SharedProductsSheetPopulator', 'SharedAccountWorkBookPopulator', 'shareaccount'])
write_file(p, content)
print(f"Fixed {p}")

# LoansApiResource.java
p = f"{BASE}/portfolio/loanaccount/api/LoansApiResource.java"
content = read_file(p)
content = remove_lines_containing(content, POSTDATED_PATTERNS + ORIGINATION_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# LoanAccountDomainServiceJpa.java
p = f"{BASE}/portfolio/loanaccount/domain/LoanAccountDomainServiceJpa.java"
content = read_file(p)
content = remove_lines_containing(content, POSTDATED_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# LoanWritePlatformServiceJpaRepositoryImpl.java
p = f"{BASE}/portfolio/loanaccount/service/LoanWritePlatformServiceJpaRepositoryImpl.java"
content = read_file(p)
content = remove_lines_containing(content, POSTDATED_PATTERNS + INVESTOR_PATTERNS + WC_PATTERNS + ORIGINATION_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# LoanAccountAutoStarter.java
p = f"{BASE}/portfolio/loanaccount/starter/LoanAccountAutoStarter.java"
content = read_file(p)
content = remove_lines_containing(content, ['ProgressiveLoanModelCheckerFilter', 'ProgressiveLoanInterestRefundServiceImpl'])
write_file(p, content)
print(f"Fixed {p}")

# LoanAccountConfiguration.java
p = f"{BASE}/portfolio/loanaccount/starter/LoanAccountConfiguration.java"
content = read_file(p)
content = remove_lines_containing(content, POSTDATED_PATTERNS + INVESTOR_PATTERNS + WC_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

# SecurityConfig.java
p = f"{BASE}/infrastructure/core/config/SecurityConfig.java"
content = read_file(p)
content = remove_lines_containing(content, ['InteropApi', 'interopApi', 'interop'])
write_file(p, content)
print(f"Fixed {p}")

# AuthorizationServerConfig.java
p = f"{BASE}/infrastructure/security/config/AuthorizationServerConfig.java"
content = read_file(p)
content = remove_lines_containing(content, ['InteropApi', 'interopApi', 'interop'])
write_file(p, content)
print(f"Fixed {p}")

# InlineJobType.java
p = f"{BASE}/infrastructure/jobs/service/InlineJobType.java"
content = read_file(p)
content = remove_lines_containing(content, WC_PATTERNS)
write_file(p, content)
print(f"Fixed {p}")

print("\n=== All fixes applied ===")
