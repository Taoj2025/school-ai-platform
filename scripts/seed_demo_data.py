"""
演示数据生成脚本
用于生成 Apple 子系统的演示数据

使用方法:
    python scripts/seed_demo_data.py

前置条件:
    1. 数据库已启动并可连接
    2. 数据库表已创建 (alembic upgrade head)
    3. 环境变量 DATABASE_URL 已设置
"""

import os
import sys
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List
import random

# 添加项目路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'apps', 'api'))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.base import Base
from app.modules.accounts.models import User, Role
from app.modules.apple.awards.models import Award, AwardRecipient
from app.modules.apple.finance.models import FinanceRecord, Quotation
from app.modules.apple.assets.models import Asset, AssetMovement
from app.modules.apple.students.models import Student, Attendance, CertificateRequest


def random_date(start_days_ago: int = 365, end_days_ago: int = 0) -> str:
    """生成随机日期"""
    start = datetime.now() - timedelta(days=start_days_ago)
    end = datetime.now() - timedelta(days=end_days_ago)
    delta = end - start
    random_days = random.randint(0, delta.days)
    return (start + timedelta(days=random_days)).strftime('%Y-%m-%d')


def create_users(db: Session) -> List[User]:
    """创建用户"""
    print("Creating users...")
    
    # 创建角色
    roles = [
        Role(name='admin', description='Administrator'),
        Role(name='apple', description='Apple Subsystem User'),
        Role(name='danielle', description='Danielle User'),
        Role(name='steven', description='Steven User'),
        Role(name='tommy', description='Tommy User'),
        Role(name='wendy', description='Wendy User'),
        Role(name='leung', description='Leung User'),
        Role(name='reviewer', description='Reviewer'),
    ]
    for role in roles:
        db.add(role)
    db.commit()
    
    # 创建用户
    users = [
        User(
            username='admin',
            email='admin@school.edu.hk',
            full_name='系統管理員',
            is_active=True,
        ),
        User(
            username='apple',
            email='apple@school.edu.hk',
            full_name='Apple 負責人',
            is_active=True,
        ),
        User(
            username='teacher1',
            email='teacher1@school.edu.hk',
            full_name='陳老師',
            is_active=True,
        ),
    ]
    for user in users:
        db.add(user)
    db.commit()
    
    print(f"  Created {len(users)} users and {len(roles)} roles")
    return users


def create_awards(db: Session) -> List[Award]:
    """创建奖项"""
    print("Creating awards...")
    
    awards_data = [
        {
            'name': '學業優異獎',
            'category': 'academic',
            'amount': Decimal('1000.00'),
            'semester': '上學期',
            'academic_year': 2025,
            'status': 'published',
            'description': '表彰學期內學業成績優異的學生',
        },
        {
            'name': '品行優良獎',
            'category': 'conduct',
            'amount': Decimal('500.00'),
            'semester': '上學期',
            'academic_year': 2025,
            'status': 'published',
            'description': '表彰品行優良的學生',
        },
        {
            'name': '服務精神獎',
            'category': 'service',
            'amount': Decimal('500.00'),
            'semester': '上學期',
            'academic_year': 2025,
            'status': 'published',
            'description': '表彰服務學校有突出表現的學生',
        },
    ]
    
    awards = []
    for data in awards_data:
        award = Award(**data)
        db.add(award)
        awards.append(award)
    
    db.commit()
    print(f"  Created {len(awards)} awards")
    return awards


def create_students(db: Session, count: int = 50) -> List[Student]:
    """创建学生"""
    print(f"Creating {count} students...")
    
    classes = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B']
    genders = ['M', 'F']
    names_male = ['陳小明', '李大文', '張志偉', '王建宏', '劉德華', '周杰倫', '吳偉強', '孫國明', '鄭家輝', '黃志明']
    names_female = ['陳美美', '李雅文', '張淑芬', '王小紅', '劉秀英', '周慧敏', '吳婉君', '孫雅琪', '鄭思敏', '黃麗娟']
    
    students = []
    for i in range(count):
        gender = random.choice(genders)
        name = random.choice(names_male) if gender == 'M' else random.choice(names_female)
        student_class = random.choice(classes)
        student_no = f"2025{student_class[0]}{str(i+1).zfill(3)}"
        
        student = Student(
            name=name,
            student_no=student_no,
            class_name=student_class,
            gender=gender,
            enrollment_date='2025-09-01',
            status='active',
            date_of_birth=f"20{random.randint(8, 13)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
            id_number=f"A{random.randint(100000, 999999)}({random.randint(0, 9)})",
            parent_name=f"{name}家長",
            parent_phone=f"{random.randint(5, 9)}{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
            address=f"香港九龍{random.choice(['彩虹區', '深水埗', '旺角', '太子'])}{random.choice(['道', '街', '路'])}{random.randint(1, 999)}號",
        )
        db.add(student)
        students.append(student)
    
    db.commit()
    print(f"  Created {len(students)} students")
    return students


def create_finance_records(db: Session, count: int = 100) -> List[FinanceRecord]:
    """创建财务记录"""
    print(f"Creating {count} finance records...")
    
    income_categories = ['tuition', 'donation', 'activity', 'other']
    expense_categories = ['supplies', 'maintenance', 'activity', 'salary', 'other']
    income_sources = ['2025-2026 第一期學費', '校友獎學金捐贈', '暑期活動報名費', '場地租借費']
    expense_vendors = ['文儀批发', '機電工程', '活動統籌', '清潔服務']
    
    records = []
    for i in range(count // 2):
        # 收入记录
        income = FinanceRecord(
            date=random_date(180, 1),
            description=random.choice(['學費收入', '捐贈', '活動收費']),
            amount=Decimal(str(random.randint(1000, 50000))),
            category=random.choice(income_categories),
            source=random.choice(income_sources),
            payment_method=random.choice(['cash', 'bank_transfer', 'cheque']),
            status='confirmed',
        )
        db.add(income)
        records.append(income)
    
    for i in range(count // 2):
        # 支出记录
        expense = FinanceRecord(
            date=random_date(180, 1),
            description=random.choice(['辦公用品', '設備維修', '活動支出', '清潔費用']),
            amount=Decimal(str(random.randint(500, 20000))),
            category=random.choice(expense_categories),
            vendor=random.choice(expense_vendors),
            payment_method=random.choice(['cash', 'bank_transfer', 'credit_card']),
            status='confirmed',
        )
        db.add(expense)
        records.append(expense)
    
    db.commit()
    print(f"  Created {len(records)} finance records")
    return records


def create_assets(db: Session, count: int = 200) -> List[Asset]:
    """创建资产"""
    print(f"Creating {count} assets...")
    
    categories = ['equipment', 'furniture', 'vehicle', 'building', 'other']
    locations = ['3樓教員室', '地下校務處', '1樓禮堂', '2樓圖書館', '4樓實驗室', '操场', '2樓美術室']
    statuses = ['normal', 'maintenance', 'written_off']
    
    assets = []
    for i in range(count):
        asset_category = random.choice(categories)
        location = random.choice(locations)
        
        asset = Asset(
            code=f"{asset_category[:2].upper()}-2025-{str(i+1).zfill(4)}",
            name=random.choice(['投影機', '辦公桌', '打印機', '冷氣機', '課室椅子', '會議桌', '白板', '投影屏幕']),
            category=asset_category,
            location=location,
            status=random.choices(statuses, weights=[85, 10, 5])[0],
            purchase_date=random_date(730, 30),
            value=Decimal(str(random.randint(500, 50000))),
            remark=f"資產備註 {i+1}" if random.random() > 0.7 else None,
        )
        db.add(asset)
        assets.append(asset)
    
    db.commit()
    print(f"  Created {len(assets)} assets")
    return assets


def create_attendance(db: Session, students: List[Student], records_per_student: int = 10) -> List[Attendance]:
    """创建考勤记录"""
    print(f"Creating attendance records...")
    
    attendances = []
    for student in students[:20]:  # 只为前20个学生创建考勤
        for _ in range(records_per_student):
            status = random.choices(
                ['present', 'absent', 'late', 'sick'],
                weights=[75, 10, 10, 5]
            )[0]
            
            attendance = Attendance(
                student_id=student.id,
                date=random_date(30, 1),
                status=status,
                remark='病假' if status == 'sick' else None,
            )
            db.add(attendance)
            attendances.append(attendance)
    
    db.commit()
    print(f"  Created {len(attendances)} attendance records")
    return attendances


def main():
    """主函数"""
    print("=" * 50)
    print("Apple 子系统演示数据生成脚本")
    print("=" * 50)
    print()
    
    # 获取数据库会话
    db = SessionLocal()
    
    try:
        # 清空现有数据 (可选，取消注释即可)
        # print("Clearing existing data...")
        # db.query(AwardRecipient).delete()
        # db.query(Award).delete()
        # db.query(Attendance).delete()
        # db.query(CertificateRequest).delete()
        # db.query(Student).delete()
        # db.query(AssetMovement).delete()
        # db.query(Asset).delete()
        # db.query(FinanceRecord).delete()
        # db.query(Quotation).delete()
        # db.query(User).delete()
        # db.query(Role).delete()
        # db.commit()
        
        # 创建演示数据
        print()
        users = create_users(db)
        awards = create_awards(db)
        students = create_students(db, count=50)
        finance_records = create_finance_records(db, count=100)
        assets = create_assets(db, count=200)
        attendances = create_attendance(db, students, records_per_student=10)
        
        # 为奖项添加获奖学生
        print("Creating award recipients...")
        for award in awards:
            for student in random.sample(students, min(len(students), 5)):
                recipient = AwardRecipient(
                    award_id=award.id,
                    student_id=student.id,
                    score=random.randint(75, 100),
                    ranking=random.randint(1, 10),
                    status='confirmed',
                )
                db.add(recipient)
        db.commit()
        
        print()
        print("=" * 50)
        print("演示数据生成完成！")
        print("=" * 50)
        print()
        print("数据统计:")
        print(f"  - 用户: {len(users)}")
        print(f"  - 奖项: {len(awards)}")
        print(f"  - 学生: {len(students)}")
        print(f"  - 财务记录: {len(finance_records)}")
        print(f"  - 资产: {len(assets)}")
        print(f"  - 考勤记录: {len(attendances)}")
        print()
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == '__main__':
    main()
