export default {
    template: `
        <div class="row justify-content-center mt-4 mb-5">
            <div class="col-md-10">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2>Company Profile</h2>
                    <button class="btn btn-secondary" @click="$router.go(-1)">Back</button>
                </div>

                <div class="card shadow-sm mb-4 border-primary" v-if="company">
                    <div class="card-header bg-dark text-white fw-bold">Overview: {{ company.company_name }}</div>
                    <div class="card-body bg-light">
                        <p><strong>Description:</strong> {{ company.description || 'No description available.' }}</p>
                        <div class="row mt-3">
                            <div class="col-md-6"><strong>Website:</strong> <a :href="company.website" target="_blank">{{ company.website || 'N/A' }}</a></div>
                            <div class="col-md-6"><strong>HR Contact:</strong> {{ company.hr_contact || 'N/A' }}</div>
                        </div>
                    </div>
                </div>

                <div class="card shadow-sm">
                    <div class="card-header bg-dark text-white fw-bold">Current Drives</div>
                    <div class="card-body p-0">
                        <table class="table table-hover mb-0">
                            <thead class="table-light"><tr v-if="companyDrives.length !== 0"><th>Sr No.</th><th>Drive Title</th><th>Deadline</th><th>Location</th><th>Action</th></tr></thead>
                            <tbody>
                                <tr v-if="companyDrives.length === 0"><td colspan="5" class="text-center">This company has no active drives right now.</td></tr>
                                <tr v-for="(drive, index) in companyDrives" :key="'cdrive'+drive.id">
                                    <td>{{ index + 1 }}</td>
                                    <td class="fw-bold">{{ drive.job_title }}</td>
                                    <td><span class="text-danger">{{ drive.application_deadline }}</span></td>
                                    <td>{{ drive.job_location || 'Not specified' }}</td>
                                    <td>
                                        <router-link :to="'/drive/' + drive.id" class="btn btn-sm btn-secondary">View</router-link>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            companyId: this.$route.params.id,
            company: null,
            allDrives: [],
            token: localStorage.getItem('auth-token')
        }
    },
    computed: {
        companyDrives() {
            return this.allDrives.filter(d => String(d.company_id) === String(this.companyId) && d.status === 'Approved');
        }
    },
    async mounted() {
        try {
            const compRes = await fetch(`/api/companies/${this.companyId}`, { headers: { 'Authentication-Token': this.token } });
            if (compRes.ok) this.company = await compRes.json();

            const driveRes = await fetch('/api/drives', { headers: { 'Authentication-Token': this.token } });
            if (driveRes.ok) this.allDrives = await driveRes.json();
        } catch (e) { console.error("Error loading company drives"); }
    }
}