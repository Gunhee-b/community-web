import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TopNavBar } from '@/components/navigation';
import { useAppStore } from '@/store';
import { theme } from '@/constants/theme';

/**
 * PrivacyScreen
 *
 * 개인정보처리방침 화면
 */
export default function PrivacyScreen() {
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar title="개인정보처리방침" showBackButton />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        <Text style={[styles.title, isDark && styles.titleDark]}>
          Rezom 개인정보처리방침
        </Text>
        <Text style={[styles.date, isDark && styles.dateDark]}>
          시행일: 2025년 11월 1일
        </Text>

        <View style={styles.section}>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            Rezom(이하 "회사")은 이용자의 개인정보를 매우 중요하게 생각하며, 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 준수하고 있습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            1. 수집하는 개인정보의 항목
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            회사는 회원가입, 서비스 제공을 위해 아래와 같은 개인정보를 수집하고 있습니다:
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 필수항목: 이메일 주소, 사용자명
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 선택항목: 프로필 이미지
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 자동 수집 항목: 서비스 이용기록, 접속 로그, 쿠키, 접속 IP 정보
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            2. 개인정보의 수집 및 이용목적
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다:
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 회원 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지, 비인가 사용 방지, 가입 의사 확인, 분쟁 조정을 위한 기록 보존
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 서비스 제공: 콘텐츠 제공, 특정 맞춤 서비스 제공
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 서비스 개선: 신규 서비스 개발 및 맞춤 서비스 제공, 통계학적 특성에 따른 서비스 제공 및 광고 게재, 서비스의 유효성 확인, 이벤트 및 광고성 정보 제공 및 참여기회 제공
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            3. 개인정보의 보유 및 이용기간
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다:
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            <Text style={styles.bold}>회원 탈퇴 시</Text>
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 보존 항목: 이메일, 사용자명, 서비스 이용기록
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 보존 이유: 서비스 부정이용 방지
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 보존 기간: 탈퇴 후 30일
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            <Text style={styles.bold}>관련 법령에 의한 정보보유</Text>
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 표시/광고에 관한 기록: 6개월 (전자상거래법)
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 웹사이트 방문기록: 3개월 (통신비밀보호법)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            4. 개인정보의 파기절차 및 방법
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다.
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            <Text style={styles.bold}>파기절차</Text>
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 이용자가 서비스 이용 등을 위해 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라(보유 및 이용기간 참조) 일정 기간 저장된 후 파기됩니다.
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            <Text style={styles.bold}>파기방법</Text>
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            5. 개인정보 제공 및 공유
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다:
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 이용자가 사전에 동의한 경우
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            6. 이용자의 권리와 그 행사방법
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며, 가입해지를 요청할 수도 있습니다.
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 개인정보 조회 및 수정: 앱 내 '설정' 메뉴에서 직접 조회 및 수정 가능
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 회원 탈퇴: 앱 내 '설정' → '계정 삭제'를 통해 가능
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            7. 개인정보 자동 수집 장치의 설치/운영 및 거부
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            회사는 이용자의 정보를 수시로 저장하고 찾아내는 '쿠키(cookie)' 등을 운용합니다. 쿠키란 회사의 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에 보내는 아주 작은 텍스트 파일로서 이용자의 기기에 저장됩니다.
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            <Text style={styles.bold}>쿠키의 사용 목적</Text>
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 이용자의 접속 빈도나 방문 시간 등을 분석
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 이용자의 취향과 관심분야 파악
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 자취 추적, 각종 이벤트 참여 정도 및 방문 회수 파악 등을 통한 타겟 마케팅 및 개인 맞춤 서비스 제공
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            8. 개인정보의 기술적/관리적 보호 대책
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            회사는 이용자의 개인정보를 취급함에 있어 개인정보가 분실, 도난, 누출, 변조 또는 훼손되지 않도록 안전성 확보를 위하여 다음과 같은 기술적/관리적 대책을 강구하고 있습니다:
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 개인정보 암호화: 이용자의 비밀번호는 암호화되어 저장 및 관리
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 해킹 등에 대비한 대책: 해킹이나 컴퓨터 바이러스 등에 의해 회원의 개인정보가 유출되거나 훼손되는 것을 막기 위해 최선을 다하고 있습니다
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 개인정보 취급 직원의 최소화 및 교육: 개인정보를 취급하는 직원을 지정하고 담당자에 한정시켜 최소화하여 개인정보를 관리하는 대책을 시행하고 있습니다
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            9. 개인정보보호 책임자
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            회사는 이용자의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 개인정보보호 책임자를 지정하고 있습니다.
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            개인정보보호 책임자 관련 문의는 앱 내 문의하기 기능을 통해 연락 주시기 바랍니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            10. 아동의 개인정보 보호
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            회사는 만 14세 미만 아동의 개인정보를 수집하지 않습니다. 만약 법정대리인이 아동이 제공한 정보에 대한 열람, 정정, 삭제를 요청하는 경우 회사는 지체 없이 필요한 조치를 취합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            11. 개인정보처리방침의 변경
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            부칙
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            본 방침은 2025년 11월 1일부터 시행됩니다.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
            Rezom
          </Text>
          <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
            개인정보 관련 문의사항이 있으시면 앱 내 문의하기를 이용해주세요.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl * 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  titleDark: {
    color: 'white',
  },
  date: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
    marginBottom: theme.spacing.xl,
  },
  dateDark: {
    color: '#8E8E93',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  sectionTitleDark: {
    color: 'white',
  },
  paragraph: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: theme.spacing.sm,
  },
  paragraphDark: {
    color: '#D1D1D6',
  },
  bold: {
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  listItem: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: theme.spacing.xs,
    paddingLeft: theme.spacing.md,
  },
  listItemDark: {
    color: '#D1D1D6',
  },
  footer: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  footerTextDark: {
    color: '#636366',
  },
});
