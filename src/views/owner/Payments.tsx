import { useEffect, useState } from 'react'
import { Card, Button, Avatar, Badge, Dialog, Select, Tooltip } from '@/components/ui'
import { HiOutlineCreditCard, HiOutlinePlus, HiOutlineDocumentDownload, HiOutlineEye, HiOutlineCheckCircle, HiOutlineClock, HiOutlineXCircle } from 'react-icons/hi'
import { getPayments, payForManager, payForAllManagers, getInvoices, getManagers } from '@/services/OwnerService'
import { Payment, Invoice, Manager } from '@/mock/data/ownerData'
import { useNavigate } from 'react-router-dom'

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
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

  const getPaymentStatusBadge = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500"><HiOutlineCheckCircle className="w-3 h-3 mr-1" />پرداخت شده</Badge>
      case 'pending':
        return <Badge className="bg-orange-500"><HiOutlineClock className="w-3 h-3 mr-1" />در انتظار</Badge>
      case 'failed':
        return <Badge className="bg-red-500"><HiOutlineXCircle className="w-3 h-3 mr-1" />ناموفق</Badge>
      default:
        return <Badge>نامشخص</Badge>
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

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)

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
          مدیریت پرداخت‌ها
        </h1>
        <div className="flex gap-3">
          <Button
            variant="default"
            icon={<HiOutlinePlus />}
            onClick={() => setBulkPayDialogOpen(true)}
          >
            پرداخت گروهی
          </Button>
          <Button
            variant="solid"
            icon={<HiOutlineCreditCard />}
            onClick={() => navigate('/owner/payments/history')}
          >
            تاریخچه پرداخت‌ها
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                مجموع پرداخت شده
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPaid)}
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
                مجموع بدهی
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalPending)}
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
                تعداد پرداخت‌ها
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {payments.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <HiOutlineCreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                فاکتورهای صادر شده
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {invoices.filter(i => i.status === 'generated').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <HiOutlineDocumentDownload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          لیست پرداخت‌ها
        </h3>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar size="md" src="" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {payment.managerName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {getPaymentTypeLabel(payment.type)}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {payment.paymentDate ? formatDate(payment.paymentDate) : 'تاریخ نامشخص'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-left">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(payment.amount)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {payment.currency}
                  </div>
                </div>

                {getPaymentStatusBadge(payment.status)}

                <div className="flex gap-2">
                  {payment.invoiceId && (
                    <Tooltip title="مشاهده فاکتور">
                      <Button
                        variant="plain"
                        size="sm"
                        icon={<HiOutlineEye />}
                        onClick={() => navigate(`/owner/payments/invoice/${payment.invoiceId}`)}
                      />
                    </Tooltip>
                  )}
                  <Tooltip title="دانلود فاکتور">
                    <Button
                      variant="plain"
                      size="sm"
                      icon={<HiOutlineDocumentDownload />}
                      disabled={!payment.invoiceId}
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}

          {payments.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              هیچ پرداختی یافت نشد
            </div>
          )}
        </div>
      </Card>

      {/* Unpaid Managers */}
      {getUnpaidManagers().length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            مدیران پرداخت نشده
          </h3>
          <div className="space-y-3">
            {getUnpaidManagers().map((manager) => (
              <div key={manager.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar size="sm" src="" />
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
            پرداخت گروهی برای همه مدیران
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
                  تعداد مدیران: {getUnpaidManagers().length}
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

export default Payments
