"""initial backend infrastructure tables

Revision ID: 001_initial
Revises:
Create Date: 2026-07-17

"""
from typing import Sequence, Union

from alembic import op

revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('CREATE TABLE ai_jobs (\n\tid VARCHAR(36) NOT NULL, \n\tjob_type VARCHAR(100) NOT NULL, \n\tprompt TEXT NOT NULL, \n\tresult TEXT, \n\tstatus aijobstatus NOT NULL, \n\tmodel VARCHAR(100), \n\terror_message TEXT, \n\tcreated_by VARCHAR(36), \n\tmodule VARCHAR(100), \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tcompleted_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id)\n)')
    op.execute('CREATE TABLE apple_assets (\n\tid VARCHAR(36) NOT NULL, \n\tasset_code VARCHAR(100) NOT NULL, \n\tname VARCHAR(200) NOT NULL, \n\tcategory VARCHAR(100) NOT NULL, \n\tdescription TEXT, \n\tpurchase_date DATE, \n\tpurchase_price NUMERIC(12, 2), \n\tcurrent_value NUMERIC(12, 2), \n\tlocation VARCHAR(200), \n\tstatus VARCHAR(50), \n\tcondition VARCHAR(50), \n\tserial_number VARCHAR(200), \n\twarranty_until DATE, \n\tattachment_id VARCHAR(36), \n\tcreated_by VARCHAR(36), \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tupdated_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id)\n)')
    op.execute('CREATE UNIQUE INDEX ix_apple_assets_asset_code ON apple_assets (asset_code)')
    op.execute('CREATE TABLE apple_awards (\n\tid VARCHAR(36) NOT NULL, \n\tname VARCHAR(200) NOT NULL, \n\taward_type VARCHAR(100) NOT NULL, \n\tacademic_year VARCHAR(20) NOT NULL, \n\tsemester VARCHAR(20), \n\tdescription TEXT, \n\tamount NUMERIC(12, 2), \n\tstatus VARCHAR(50), \n\tcreated_by VARCHAR(36), \n\tapproved_by VARCHAR(36), \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tupdated_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id)\n)')
    op.execute('CREATE TABLE apple_finance_records (\n\tid VARCHAR(36) NOT NULL, \n\trecord_type VARCHAR(50) NOT NULL, \n\tcategory VARCHAR(100) NOT NULL, \n\tdescription TEXT NOT NULL, \n\tamount NUMERIC(12, 2) NOT NULL, \n\ttransaction_date DATE NOT NULL, \n\tacademic_year VARCHAR(20) NOT NULL, \n\tsemester VARCHAR(20), \n\tpayment_method VARCHAR(50), \n\treceipt_no VARCHAR(100), \n\tattachment_id VARCHAR(36), \n\tstatus VARCHAR(50), \n\tcreated_by VARCHAR(36), \n\tapproved_by VARCHAR(36), \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tupdated_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id)\n)')
    op.execute('CREATE TABLE apple_students (\n\tid VARCHAR(36) NOT NULL, \n\tstudent_no VARCHAR(50) NOT NULL, \n\tname_en VARCHAR(200) NOT NULL, \n\tname_zh VARCHAR(200), \n\tgender VARCHAR(10), \n\tdate_of_birth DATE, \n\tclass_name VARCHAR(100) NOT NULL, \n\tclass_no VARCHAR(10), \n\tadmission_date DATE, \n\tstatus VARCHAR(50), \n\tparent_name VARCHAR(200), \n\tparent_phone VARCHAR(50), \n\tparent_email VARCHAR(255), \n\taddress TEXT, \n\tnotes TEXT, \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tupdated_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id)\n)')
    op.execute('CREATE UNIQUE INDEX ix_apple_students_student_no ON apple_students (student_no)')
    op.execute('CREATE INDEX ix_apple_students_class_name ON apple_students (class_name)')
    op.execute('CREATE TABLE approvals (\n\tid VARCHAR(36) NOT NULL, \n\tmodule VARCHAR(100) NOT NULL, \n\tresource_type VARCHAR(100) NOT NULL, \n\tresource_id VARCHAR(36) NOT NULL, \n\tstatus approvalstatus NOT NULL, \n\trequested_by VARCHAR(36) NOT NULL, \n\treviewed_by VARCHAR(36), \n\treview_comment TEXT, \n\tmetadata JSON, \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\treviewed_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id)\n)')
    op.execute('CREATE TABLE audit_logs (\n\tid VARCHAR(36) NOT NULL, \n\tuser_id VARCHAR(36), \n\tusername VARCHAR(100), \n\taction VARCHAR(100) NOT NULL, \n\tresource_type VARCHAR(100), \n\tresource_id VARCHAR(36), \n\tmodule VARCHAR(100), \n\tdetails JSON, \n\tip_address VARCHAR(50), \n\tuser_agent VARCHAR(500), \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id)\n)')
    op.execute('CREATE TABLE files (\n\tid VARCHAR(36) NOT NULL, \n\toriginal_name VARCHAR(500) NOT NULL, \n\tstored_name VARCHAR(500) NOT NULL, \n\tfile_path TEXT NOT NULL, \n\tfile_size INTEGER NOT NULL, \n\tmime_type VARCHAR(200), \n\tuploaded_by VARCHAR(36), \n\tmodule VARCHAR(100), \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id)\n)')
    op.execute('CREATE TABLE ocr_jobs (\n\tid VARCHAR(36) NOT NULL, \n\tfile_id VARCHAR(36), \n\tfile_path TEXT NOT NULL, \n\tstatus ocrjobstatus NOT NULL, \n\tresult_text TEXT, \n\terror_message TEXT, \n\tlanguage VARCHAR(10), \n\tcreated_by VARCHAR(36), \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tcompleted_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id)\n)')
    op.execute('CREATE TABLE permissions (\n\tid VARCHAR(36) NOT NULL, \n\tcode VARCHAR(200) NOT NULL, \n\tdescription TEXT, \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id)\n)')
    op.execute('CREATE UNIQUE INDEX ix_permissions_code ON permissions (code)')
    op.execute('CREATE TABLE roles (\n\tid VARCHAR(36) NOT NULL, \n\tname VARCHAR(50) NOT NULL, \n\tdescription TEXT, \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id)\n)')
    op.execute('CREATE UNIQUE INDEX ix_roles_name ON roles (name)')
    op.execute('CREATE TABLE users (\n\tid VARCHAR(36) NOT NULL, \n\tusername VARCHAR(100) NOT NULL, \n\temail VARCHAR(255) NOT NULL, \n\thashed_password VARCHAR(255) NOT NULL, \n\tdisplay_name VARCHAR(200), \n\tis_active BOOLEAN, \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tupdated_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id)\n)')
    op.execute('CREATE UNIQUE INDEX ix_users_username ON users (username)')
    op.execute('CREATE UNIQUE INDEX ix_users_email ON users (email)')
    op.execute('CREATE TABLE apple_asset_movements (\n\tid VARCHAR(36) NOT NULL, \n\tasset_id VARCHAR(36) NOT NULL, \n\tmovement_type VARCHAR(50) NOT NULL, \n\tfrom_location VARCHAR(200), \n\tto_location VARCHAR(200), \n\tfrom_person VARCHAR(200), \n\tto_person VARCHAR(200), \n\treason TEXT, \n\tmovement_date DATE NOT NULL, \n\tcreated_by VARCHAR(36), \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id), \n\tFOREIGN KEY(asset_id) REFERENCES apple_assets (id) ON DELETE CASCADE\n)')
    op.execute('CREATE INDEX ix_apple_asset_movements_asset_id ON apple_asset_movements (asset_id)')
    op.execute('CREATE TABLE apple_attendance (\n\tid VARCHAR(36) NOT NULL, \n\tstudent_id VARCHAR(36) NOT NULL, \n\tdate DATE NOT NULL, \n\tstatus VARCHAR(50) NOT NULL, \n\tperiod VARCHAR(20), \n\tremark TEXT, \n\trecorded_by VARCHAR(36), \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id), \n\tFOREIGN KEY(student_id) REFERENCES apple_students (id) ON DELETE CASCADE\n)')
    op.execute('CREATE INDEX ix_apple_attendance_student_id ON apple_attendance (student_id)')
    op.execute('CREATE INDEX ix_apple_attendance_date ON apple_attendance (date)')
    op.execute('CREATE TABLE apple_award_recipients (\n\tid VARCHAR(36) NOT NULL, \n\taward_id VARCHAR(36) NOT NULL, \n\tstudent_id VARCHAR(36) NOT NULL, \n\tstudent_name VARCHAR(200), \n\tclass_name VARCHAR(100), \n\treason TEXT, \n\tamount NUMERIC(12, 2), \n\tstatus VARCHAR(50), \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id), \n\tFOREIGN KEY(award_id) REFERENCES apple_awards (id) ON DELETE CASCADE\n)')
    op.execute('CREATE INDEX ix_apple_award_recipients_student_id ON apple_award_recipients (student_id)')
    op.execute('CREATE INDEX ix_apple_award_recipients_award_id ON apple_award_recipients (award_id)')
    op.execute('CREATE TABLE apple_certificate_requests (\n\tid VARCHAR(36) NOT NULL, \n\tstudent_id VARCHAR(36) NOT NULL, \n\tcertificate_type VARCHAR(100) NOT NULL, \n\tpurpose TEXT, \n\tquantity INTEGER, \n\tstatus VARCHAR(50), \n\trequested_by VARCHAR(36), \n\tissued_date DATE, \n\tnotes TEXT, \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tupdated_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id), \n\tFOREIGN KEY(student_id) REFERENCES apple_students (id) ON DELETE CASCADE\n)')
    op.execute('CREATE INDEX ix_apple_certificate_requests_student_id ON apple_certificate_requests (student_id)')
    op.execute('CREATE TABLE apple_quotations (\n\tid VARCHAR(36) NOT NULL, \n\tfinance_record_id VARCHAR(36), \n\tvendor_name VARCHAR(200) NOT NULL, \n\titem_description TEXT NOT NULL, \n\tunit_price NUMERIC(12, 2) NOT NULL, \n\tquantity NUMERIC(10, 2), \n\ttotal_price NUMERIC(12, 2) NOT NULL, \n\tquotation_date DATE, \n\tvalid_until DATE, \n\tattachment_id VARCHAR(36), \n\tstatus VARCHAR(50), \n\tcreated_by VARCHAR(36), \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id), \n\tFOREIGN KEY(finance_record_id) REFERENCES apple_finance_records (id) ON DELETE SET NULL\n)')
    op.execute('CREATE INDEX ix_apple_quotations_finance_record_id ON apple_quotations (finance_record_id)')
    op.execute('CREATE TABLE role_permissions (\n\tid VARCHAR(36) NOT NULL, \n\trole_id VARCHAR(36) NOT NULL, \n\tpermission_id VARCHAR(36) NOT NULL, \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id), \n\tFOREIGN KEY(role_id) REFERENCES roles (id) ON DELETE CASCADE, \n\tFOREIGN KEY(permission_id) REFERENCES permissions (id) ON DELETE CASCADE\n)')
    op.execute('CREATE INDEX ix_role_permissions_permission_id ON role_permissions (permission_id)')
    op.execute('CREATE INDEX ix_role_permissions_role_id ON role_permissions (role_id)')
    op.execute('CREATE TABLE user_roles (\n\tid VARCHAR(36) NOT NULL, \n\tuser_id VARCHAR(36) NOT NULL, \n\trole_id VARCHAR(36) NOT NULL, \n\tcreated_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id), \n\tFOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, \n\tFOREIGN KEY(role_id) REFERENCES roles (id) ON DELETE CASCADE\n)')
    op.execute('CREATE INDEX ix_user_roles_user_id ON user_roles (user_id)')
    op.execute('CREATE INDEX ix_user_roles_role_id ON user_roles (role_id)')


def downgrade() -> None:
    op.drop_table('user_roles')
    op.drop_table('role_permissions')
    op.drop_table('apple_quotations')
    op.drop_table('apple_certificate_requests')
    op.drop_table('apple_award_recipients')
    op.drop_table('apple_attendance')
    op.drop_table('apple_asset_movements')
    op.drop_table('users')
    op.drop_table('roles')
    op.drop_table('permissions')
    op.drop_table('ocr_jobs')
    op.drop_table('files')
    op.drop_table('audit_logs')
    op.drop_table('approvals')
    op.drop_table('apple_students')
    op.drop_table('apple_finance_records')
    op.drop_table('apple_awards')
    op.drop_table('apple_assets')
    op.drop_table('ai_jobs')
