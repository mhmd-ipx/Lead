import { useEffect, useState } from 'react'
import { Card, Button, Progress, Tag } from '@/components/ui'
import {
  HiOutlineDocumentText,
  HiOutlineCash,
  HiOutlineUsers,
  HiOutlineUserAdd,
  HiOutlineClipboardCheck,
  HiOutlineAcademicCap,
  HiOutlineArrowRight,
} from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import type { Bill, FinancialDocument } from '@/mock/data/ownerData'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [financialDocs, setFinancialDocs] = useState<FinancialDocument[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const navigate = useNavigate()

  // Mock applicants data
  const applicantsStats = {
    total: 12,
    active: 8,
    assessmentCompleted: 5,
    assessmentPending: 7,
    examsCompleted: 3,
    examsPending: 4,
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Mock data
      const mockDocs: FinancialDocument[] = [
        {
          id: 'fd-001',
          managerName: 'علی محمدی',
          title: 'هزینه آزمون',
          amount: 500000,
          currency: 'IRR',
          status: 'pending',
          createdDate: '2024-12-01T10:00:00Z',
        },
        {
          id: 'fd-002',
          managerName: 'سارا احمدی',
          title: 'هزینه دوره',
          amount: 300000,
          currency: 'IRR',
          status: 'paid',
          createdDate: '2024-11-20T10:00:00Z',
        },
      ]

      const mockBills: Bill[] = [
        {
          id: 'bill-001',
          billNumber: 'B-2024-001',
          financialDocumentIds: ['fd-002'],
          totalAmount: 300000,
          currency: 'IRR',
          status: 'paid',
          createdDate: '2024-11-25T10:00:00Z',
          paidDate: '2024-11-26T10:00:00Z',
          officialInvoiceRequested: true,
        },
        {
          id: 'bill-002',
          billNumber: 'B-2024-002',
          financialDocumentIds: ['fd-001'],
          totalAmount: 500000,
          currency: 'IRR',
          status: 'pending',
          createdDate: '2024-12-05T10:00:00Z',
          officialInvoiceRequested: false,
        },
      ]

      setFinancialDocs(mockDocs)
      setBills(mockBills)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const paidDocsAmount = financialDocs.filter((d) => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0)
  const pendingDocsAmount = financialDocs.filter((d) => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0)
  const totalAmount = paidDocsAmount + pendingDocsAmount

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
  }

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">داشبورد</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          خلاصه‌ای از وضعیت امور مالی و متقاضیان
        </p>
      </div>

      {/* Section 1: Financial Overview */}
      <Card id="dashboard-financial-card" className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">امور مالی</h2>
          <Button
            variant="plain"
            size="sm"
            icon={<HiOutlineArrowRight />}
            onClick={() => navigate('/owner/accounting/documents')}
          >
            مشاهده همه
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total */}
          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                <HiOutlineDocumentText className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">مجموع کل</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              {financialDocs.length} سند مالی • {bills.length} صورتحساب
            </p>
          </div>

          {/* Paid */}
          <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
                <HiOutlineClipboardCheck className="w-5 h-5 text-green-600 dark:text-green-300" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">پرداخت شده</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(paidDocsAmount)}
            </p>
            <Progress
              percent={(paidDocsAmount / totalAmount) * 100}
              customColorClass="bg-green-500"
              className="mt-3"
            />
          </div>

          {/* Pending */}
          <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-lg">
                <HiOutlineCash className="w-5 h-5 text-amber-600 dark:text-amber-300" />
              </div>
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">در انتظار پرداخت</span>
            </div>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {formatCurrency(pendingDocsAmount)}
            </p>
            <Button
              variant="solid"
              size="sm"
              className="w-full mt-3 bg-amber-600 hover:bg-amber-700"
              onClick={() => navigate('/owner/accounting/documents?tab=unpaid')}
            >
              پرداخت اسناد
            </Button>
          </div>
        </div>
      </Card>

      {/* Section 2: Applicants Overview */}
      <Card id="dashboard-applicants-card" className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">متقاضیان</h2>
          <div className="flex gap-2">
            <Button
              variant="plain"
              size="sm"
              icon={<HiOutlineArrowRight />}
              onClick={() => navigate('/owner/managers')}
            >
              مشاهده همه
            </Button>
            <Button
              variant="solid"
              size="sm"
              icon={<HiOutlineUserAdd />}
              onClick={() => navigate('/owner/managers/add')}
            >
              افزودن متقاضی
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Applicants */}
          <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <HiOutlineUsers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">تعداد متقاضیان</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {applicantsStats.total}
            </p>
            <Tag className="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-100 border-0 mt-2">
              {applicantsStats.active} فعال
            </Tag>
          </div>

          {/* Assessment Status */}
          <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <HiOutlineClipboardCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">نیازسنجی</p>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">تکمیل شده</span>
                <span className="text-sm font-bold text-green-600">{applicantsStats.assessmentCompleted}</span>
              </div>
              <Progress
                percent={(applicantsStats.assessmentCompleted / applicantsStats.total) * 100}
                customColorClass="bg-green-500"
              />
            </div>
            <Button
              variant="plain"
              size="sm"
              className="w-full mt-3"
              onClick={() => navigate('/owner/assessment')}
            >
              مشاهده نیازسنجی‌ها
            </Button>
          </div>

          {/* Exams Status */}
          <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                <HiOutlineAcademicCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">آزمون‌ها</p>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">انجام شده</span>
                <span className="text-sm font-bold text-indigo-600">{applicantsStats.examsCompleted}</span>
              </div>
              <Progress
                percent={(applicantsStats.examsCompleted / (applicantsStats.examsCompleted + applicantsStats.examsPending)) * 100}
                customColorClass="bg-indigo-500"
              />
            </div>
            <Button
              variant="plain"
              size="sm"
              className="w-full mt-3"
              onClick={() => navigate('/owner/exams')}
            >
              مشاهده آزمون‌ها
            </Button>
          </div>

          {/* Quick Actions */}
          <div id="dashboard-quick-actions" className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">دسترسی سریع</p>
            <div className="space-y-2">
              <Button
                variant="solid"
                size="sm"
                className="w-full"
                icon={<HiOutlineUserAdd />}
                onClick={() => navigate('/owner/managers/add')}
              >
                افزودن متقاضی
              </Button>
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={() => navigate('/owner/exams/assigned')}
              >
                اختصاص آزمون
              </Button>
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={() => navigate('/owner/results')}
              >
                مشاهده نتایج
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
