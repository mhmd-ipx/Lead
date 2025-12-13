import { useEffect, useState, useMemo } from 'react'
import { Card, Button, Badge, Dialog, Select, Tooltip, Table, Tabs } from '@/components/ui'
import { HiOutlinePlus, HiOutlineDocumentDownload, HiOutlineEye, HiOutlineCheckCircle, HiOutlineClock, HiOutlineXCircle, HiOutlineDocumentText, HiOutlineCreditCard } from 'react-icons/hi'
import { getPayments, payForManager, payForAllManagers, getInvoices, getManagers } from '@/services/OwnerService'
import { Payment, Invoice, Manager } from '@/mock/data/ownerData'
import { useNavigate } from 'react-router-dom'

const { TabNav, TabList, TabContent } = Tabs

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [invoiceTab, setInvoiceTab] = useState<'all' | 'paid' | 'unpaid'>('all')
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [bulkPayDialogOpen, setBulkPayDialogOpen] = useState(false)
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null)
  const [paymentType, setPaymentType] = useState<'before_results' | 'after_results'>('after_results')
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [paymentsData, managersData, invoicesData] = await Promise.all([
        getPayments(),
        getManagers(),
        getInvoices()
      ])
      setPayments(paymentsData)
      setManagers(managersData)
      setInvoices(invoicesData)
    } catch (error) {
      console.error('Error loading payments data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayForManager = async () => {
    if (!selectedManager) return

    try {
      const newPayment = await payForManager(selectedManager.id, paymentType)
      setPayments([...payments, newPayment])
      setPayDialogOpen(false)
      setSelectedManager(null)
      alert('پرداخت با موفقیت انجام شد')
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('خطا در انجام پرداخت')
    }
  }

  const handlePayForAllManagers = async () => {
    try {
      const newPayments = await payForAllManagers(paymentType)
      setPayments([...payments, ...newPayments])
      setBulkPayDialogOpen(false)
      alert('پرداخت برای همه مدیران با موفقیت انجام شد')
    } catch (error) {
      console.error('Error processing bulk payment:', error)
      alert('خطا در انجام پرداخت گروهی')
    }
  }

  const getPaymentTypeLabel = (type: Payment['type']) => {
    return type === 'before_results' ? 'قبل از صدور نتایج' : 'بعد از صدور نتایج'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  const getUnpaidManagers = () => {
    const paidManagerIds = payments
      .filter(p => p.status === 'paid')
      .map(p => p.managerId)

    return managers.filter(m => !paidManagerIds.includes(m.id))
  }

  // Invoice statistics
  const totalInvoices = invoices.length
  const totalInvoiceAmount = invoices.reduce((sum, i) => sum + i.amount, 0)

  // Map invoice status to payment-like status for calculations  
  const paidInvoices = invoices.filter(i => i.status === 'generated' || i.status === 'sent')
  const unpaidInvoices = invoices.filter(i => i.status === 'requested')

  const paidInvoiceAmount = paidInvoices.reduce((sum, i) => sum + i.amount, 0)
  const unpaidInvoiceAmount = unpaidInvoices.reduce((sum, i) => sum + i.amount, 0)

  // Filtered invoices based on tab
  const filteredInvoices = useMemo(() => {
    switch (invoiceTab) {
      case 'paid':
        return paidInvoices
      case 'unpaid':
        return unpaidInvoices
      default:
        return invoices
    }
  }, [invoices, invoiceTab, paidInvoices, unpaidInvoices])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          فاکتورها
        </h1>
        <div className="flex gap-3">
          <Button
            variant="solid"
            icon={<HiOutlinePlus />}
            onClick={() => setBulkPayDialogOpen(true)}
          >
            پرداخت گروهی
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                مجموع کل
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalInvoiceAmount)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <HiOutlineDocumentText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                پرداخت شده
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(paidInvoiceAmount)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <HiOutlineCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                پرداخت نشده
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(unpaidInvoiceAmount)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <HiOutlineClock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                تعداد فاکتورها
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {totalInvoices}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <HiOutlineCreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Invoices Tabs */}
      <Card>
        <Tabs value={invoiceTab} onChange={(val) => setInvoiceTab(val as 'all' | 'paid' | 'unpaid')}>
          <TabList>
            <TabNav value="all">همه فاکتورها</TabNav>
            <TabNav value="paid">پرداخت شده</TabNav>
            <TabNav value="unpaid">پرداخت نشده</TabNav>
          </TabList>
          <div className="p-4">
            <TabContent value={invoiceTab}>
              <InvoicesTable
                invoices={filteredInvoices}
                navigate={navigate}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </TabContent>
          </div>
        </Tabs>
      </Card>

      {/* Unpaid Managers */}
      {getUnpaidManagers().length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            متقاضیان پرداخت نشده
          </h3>
          <div className="space-y-3">
            {getUnpaidManagers().map((manager) => (
              <div key={manager.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {manager.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {manager.position}
                    </div>
                  </div>
                </div>
                <Button
                  variant="solid"
                  size="sm"
                  onClick={() => {
                    setSelectedManager(manager)
                    setPayDialogOpen(true)
                  }}
                >
                  پرداخت
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Individual Payment Dialog */}
      <Dialog
        isOpen={payDialogOpen}
        onClose={() => setPayDialogOpen(false)}
        onRequestClose={() => setPayDialogOpen(false)}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            پرداخت برای {selectedManager?.name}
          </h3>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                نوع پرداخت
              </label>
              <Select
                value={{ value: paymentType, label: paymentType === 'before_results' ? 'قبل از صدور نتایج' : 'بعد از صدور نتایج' }}
                onChange={(option) => setPaymentType(option?.value as 'before_results' | 'after_results')}
                options={[
                  { value: 'before_results', label: 'قبل از صدور نتایج' },
                  { value: 'after_results', label: 'بعد از صدور نتایج' }
                ]}
              />
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">مبلغ:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(500000)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="plain"
              onClick={() => setPayDialogOpen(false)}
            >
              انصراف
            </Button>
            <Button
              variant="solid"
              onClick={handlePayForManager}
            >
              پرداخت
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Bulk Payment Dialog */}
      <Dialog
        isOpen={bulkPayDialogOpen}
        onClose={() => setBulkPayDialogOpen(false)}
        onRequestClose={() => setBulkPayDialogOpen(false)}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            پرداخت گروهی برای همه متقاضی
          </h3>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                نوع پرداخت
              </label>
              <Select
                value={{ value: paymentType, label: paymentType === 'before_results' ? 'قبل از صدور نتایج' : 'بعد از صدور نتایج' }}
                onChange={(option) => setPaymentType(option?.value as 'before_results' | 'after_results')}
                options={[
                  { value: 'before_results', label: 'قبل از صدور نتایج' },
                  { value: 'after_results', label: 'بعد از صدور نتایج' }
                ]}
              />
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  تعداد متقاضی: {getUnpaidManagers().length}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  مجموع: {formatCurrency(getUnpaidManagers().length * 500000)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="plain"
              onClick={() => setBulkPayDialogOpen(false)}
            >
              انصراف
            </Button>
            <Button
              variant="solid"
              onClick={handlePayForAllManagers}
            >
              پرداخت گروهی
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

// Invoices Table Component
const InvoicesTable = ({ invoices, navigate, formatCurrency, formatDate }: {
  invoices: Invoice[]
  navigate: (path: string) => void
  formatCurrency: (amount: number) => string
  formatDate: (dateString: string) => string
}) => {
  const { THead, TBody, Tr, Th, Td } = Table

  const getInvoiceStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'generated':
      case 'sent':
        return <Badge className="bg-green-500"><HiOutlineCheckCircle className="w-3 h-3 mr-1" />پرداخت شده</Badge>
      case 'requested':
        return <Badge className="bg-orange-500"><HiOutlineClock className="w-3 h-3 mr-1" />در انتظار</Badge>
      default:
        return <Badge>نامشخص</Badge>
    }
  }

  return (
    <Table>
      <THead>
        <Tr>
          <Th>شناسه فاکتور</Th>
          <Th>عنوان</Th>
          <Th>متقاضی</Th>
          <Th>مبلغ</Th>
          <Th>تاریخ</Th>
          <Th>وضعیت</Th>
          <Th>اقدامات</Th>
        </Tr>
      </THead>
      <TBody>
        {invoices.map((invoice) => (
          <Tr key={invoice.id}>
            <Td>#{invoice.id}</Td>
            <Td>فاکتور {invoice.managerName}</Td>
            <Td>{invoice.managerName}</Td>
            <Td>{formatCurrency(invoice.amount)}</Td>
            <Td>{formatDate(invoice.requestDate)}</Td>
            <Td>{getInvoiceStatusBadge(invoice.status)}</Td>
            <Td>
              <div className="flex gap-2">
                <Tooltip title="مشاهده فاکتور">
                  <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineEye />}
                    onClick={() => navigate(`/owner/payments/invoice/${invoice.id}`)}
                  />
                </Tooltip>
                <Tooltip title="دانلود فاکتور">
                  <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineDocumentDownload />}
                    disabled={!invoice.pdfUrl}
                  />
                </Tooltip>
                <Tooltip title="درخواست فاکتور رسمی">
                  <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineDocumentText />}
                    disabled={invoice.status !== 'requested'}
                  />
                </Tooltip>
              </div>
            </Td>
          </Tr>
        ))}
        {invoices.length === 0 && (
          <Tr>
            <Td colSpan={7}>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                هیچ فاکتوری یافت نشد
              </div>
            </Td>
          </Tr>
        )}
      </TBody>
    </Table>
  )
}

export default Payments
